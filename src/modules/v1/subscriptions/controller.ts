/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, createReference, success } from "../../common/utils"
import PlanService from "../plans/service"
import { configs } from "../../common/utils/config"
import Paystack from "../../thirdpartyApi/paystack"
import CardService from "../cards/service"
import { composeCardPayment } from "./helper"
import SubscriptionService from "./service"
import UserService from "../users/service"
import agenda from "../../common/queue/agenda"
import { Queue_Identifier } from "../../common/queue/identifiers"

export const subscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { planId, userId } = req.query
    try {
        const user = await new UserService({ id: String(userId) }).findOne();
        if (!user) {
            throw catchError('Unrecognized user')
        }
        const plan = await new PlanService({ id: String(planId) }).findOne()

        if (!plan)
            throw catchError("Invalid plan selected. Try again later", 400)

        const reference = createReference("PLAN")

        return res.render("payment.ejs", {
            email: user.email,
            reference,
            customerId: user.id,
            amount: plan.amount * 100,
            currency: "NGN" || plan.currency,
            paymentType: "fund-account",
            phone: user.phoneNumber || "",
            base_url: configs.BACKEND_URL,
            fullName: `${user.firstName} ${user.lastName}`,
            key:
                configs.PAYSTACK_ENV === "production"
                    ? configs.PAYSTACK_PROD_PUBLIC_KEY
                    : configs.PAYSTACK_PUBLIC_KEY,
        })
    } catch (error) {
        next(error)
    }
}

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { reference, planId } = req.body
    try {
        const subscription = await new SubscriptionService({ plan: planId, reference, userId: req.user.id }).findOne();

        if (subscription) throw catchError("Subscription already processed", 400);

        const paystack = await new Paystack(reference).verifyTransaction()

        if (!paystack)
            throw catchError(
                "We're unable to process your payment. Please contact support if issue persist!"
            )

        const [card, plan] = await Promise.all([
            new CardService({
                lastFour: paystack.authorization.last4,
                userId: req.user.id,
            }).findOne(),
            new PlanService({ id: planId }).findOne(),
        ])

        if (!plan) throw catchError("Invalid Plan selected", 400)

        const dataToProcess = await composeCardPayment(
            req.user,
            plan,
            card,
            paystack
        )
        const paymentDone = await Promise.all(dataToProcess)
        await agenda.schedule(`${plan.interval === "monthly" ? "in one month" : "in one year"}`, Queue_Identifier.RENEW_SUBSCRIPTION, { userId: req.user.id })

        return res
            .status(200)
            .json(success("Card payment successfully", paymentDone))
    } catch (error) {
        next(error)
    }
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { limit = 10, next: nextPage, prev } = req.query
    try {
        const subscriptions = await new SubscriptionService({ userId: req.user.id }).findAll({

        }, Number(limit), String(nextPage), String(prev))

        return res
            .status(200)
            .json(success("Card payment successfully", subscriptions))
    } catch (error) {
        next(error)
    }
}
