/** @format */

import { NextFunction, Request, Response } from "express"
import {
    catchError,
    success,
    tryPromise,
} from "../../common/utils"
import PlanService from "../plans/service"
import { composeVirtual } from "./helper"
import SubscriptionService from "./service"
import UserService from "../users/service"
import agenda from "../../common/queue/agenda"
import { Queue_Identifier } from "../../common/queue/identifiers"
import PSB9 from "../../thirdpartyApi/9payment"
import { addMonths, addYears } from "date-fns"

export const subscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { planId, amount, accountNumber, bankCode, fee } = req.body
    try {
        const [user, plan] = await Promise.all([
            new UserService({ id: String(req.user.id) }).findOne(),
            new PlanService({ id: String(planId) }).findOne(),
        ])
        if (!user) {
            throw catchError("Unrecognized user")
        }

        if (!user.verified)
            throw catchError(
                "You've to verify your account before subscribing",
                400
            )

        if (!plan)
            throw catchError("Invalid plan selected. Try again later", 400)

        if (user.subscriptionId) {
            const sub = await new SubscriptionService({
                id: String(user.subscriptionId),
            }).findOne()
            if (sub?.isActive) throw catchError("You've a active subscription.")
        }

        const payload = composeVirtual({
            fee,
            user,
            amount,
            bankCode,
            accountNumber,
            description: `Subscribing to plan ${plan.name}`,
        })

        const transaction = await new PSB9().createStaticVirtualAccount({ ...payload })

        await agenda.schedule(
            "in 5 minutes",
            Queue_Identifier.INITIATE_SUBSCRIPTION,
            { reference: transaction.transaction.reference, planId, user, accountNumber: transaction.customer.account.number, amount }
        );

        return res.status(200).json(success('Dynamic account available', { details: transaction?.customer, reference: transaction?.transaction.reference }))
    } catch (error) {
        next(error)
    }
}

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { reference, planId, accountNumber, amount } = req.body
    try {
        const subscription = await new SubscriptionService({
            plan: planId,
            reference,
            userId: req.user.id,
        }).findOne()

        if (subscription)
            throw catchError("Subscription already processed", 400)

        const transaction = await new PSB9().confirmPayment({
            reference,
            sessionid: "",
            amount,
            accountnumber: accountNumber,
        })

        if (!transaction?.transactions?.length)
            throw catchError(
                "Your payment is still pending!"
            )
        const [plan] = await Promise.all([
            new PlanService({ id: planId }).findOne(),
        ])

        if (!plan) throw catchError("Invalid Plan selected", 400)

            await new SubscriptionService({}).create({
                isActive: true,
                paidAt: new Date(),
                expiresAt:
                    plan.interval === "monthly"
                        ? addMonths(new Date(), 1)
                        : addYears(new Date(), 1),
                plan: String(plan.id),
                reference: reference,
                userId: String(req.user.id)
            });
    
            await agenda.schedule(
                `${plan.interval === "monthly" ? "in one month" : "in one year"}`,
                Queue_Identifier.DEACTIVATE_SUBSCRIPTION,
                { userId: req.user.id }
            )

        return res
            .status(200)
            .json(success("Payment successfully", {}))
    } catch (error) {
        next(error)
    }
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { limit = 10, next: nextPage, prev, admin } = req.query
    try {
        let subscriptions = await new SubscriptionService({}).findAll(
            {
                ...(!admin && {
                    userId: req.user.id,
                }),
            },
            Number(limit),
            String(nextPage),
            String(prev)
        )

        const ids = subscriptions.edges.map(edge => String(edge.plan))

        if (ids.length) {
            const [plans] = await tryPromise(new PlanService({}).findByIds(ids))

            if (plans?.length) {
                const data = subscriptions.edges.map(edge => {
                    const plan = plans.find(
                        item => String(item.id) === String(edge.plan)
                    )
                    // @ts-ignore
                    if (plan) edge.plan = plan

                    return edge
                })
                subscriptions.edges = data
            }
        }

        if (admin) {
            const userIds = subscriptions.edges.map(edge => String(edge.userId))

            if (userIds.length) {
                const [users] = await tryPromise(
                    new UserService({}).findByIds(userIds)
                )

                if (users?.length) {
                    const data = subscriptions.edges.map(edge => {
                        const user = users.find(
                            item => String(item.id) === String(edge.userId)
                        )
                        // @ts-ignore
                        if (user) edge.user = user

                        return edge
                    })
                    subscriptions.edges = data
                }
            }
        }

        return res
            .status(200)
            .json(
                success("Subscriptions retrieved successfully", subscriptions)
            )
    } catch (error) {
        next(error)
    }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let [subscription, error] = await tryPromise(
            new SubscriptionService({
                userId: req.user.id,
                isActive: true,
            }).findOne()
        )

        if (error) throw catchError("Error retrieving subscription")

        if (subscription) {
            const [plan, error] = await tryPromise(
                new PlanService({ id: subscription.plan }).findOne()
            )

            if (error) throw catchError("Error processing request")

            // @ts-ignore
            subscription.plan = plan
        }

        return res
            .status(200)
            .json(success("Subscription successfully retrieved", subscription))
    } catch (error) {
        next(error)
    }
}
