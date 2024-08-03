/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, createReference, success } from "../../common/utils"
import PlanService from "../plans/service"
import { configs } from "../../common/utils/config"
import Paystack from "../../thirdpartyApi/paystack"
import CardService from "../cards/service"
import { composeCardPayment } from "./helper"
import SubscriptionService from "./service"

export const subscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { planId } = req.query
    const { isAdmin, firstName, lastName } = req.user
    try {
        if (isAdmin) throw catchError("Admin account cannot subscribe", 400)

        const plan = await new PlanService({ id: String(planId) }).findOne()

        if (!plan)
            throw catchError("Invalid plan selected. Try again later", 400)

        const reference = createReference("PLAN")

        return res.render("payment.ejs", {
            email: req.user.email,
            reference,
            customerId: req.user.id,
            amount: plan.amount * 100,
            paymentType: "fund-account",
            phone: req.user.phoneNumber || "",
            base_url: configs.BACKEND_URL,
            fullName: `${firstName} ${lastName}`,
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
        const subscriptions = await new SubscriptionService({}).findAll({

        }, Number(limit), String(nextPage), String(prev))

        return res
            .status(200)
            .json(success("Card payment successfully", subscriptions))
    } catch (error) {
        next(error)
    }
}
