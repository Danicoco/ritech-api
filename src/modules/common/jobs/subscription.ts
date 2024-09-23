/** @format */

import { Agenda } from "@hokify/agenda"
import { Queue_Identifier } from "../queue/identifiers"
import UserService from "../../v1/users/service"
import SubscriptionService from "../../v1/subscriptions/service"
import { differenceInDays } from "date-fns"
import { catchError, createReference } from "../utils"
import Paystack from "../../thirdpartyApi/paystack"
import CardService from "../../v1/cards/service"
import PlanService from "../../v1/plans/service"
import { composeCardPayment } from "../../v1/subscriptions/helper"

export const renewSubscription = async (agenda: Agenda) => {
    agenda.define(Queue_Identifier.RENEW_SUBSCRIPTION, async (job, done) => {
        const { userId: id } = job.attrs.data
        const user = await new UserService({ id }).findOne()
        if (user) {
            const [subscription, card] = await Promise.all([
                new SubscriptionService({ id: user.subscriptionId }).findOne(),
                new CardService({ userId: id, isActive: true }).findOne(),
            ])
            if (!subscription)
                job.fail(new Error("Subscription does not exist"))
            if (!card) job.fail(new Error("No card to charge"))
            const plan = await new PlanService({
                id: String(subscription?.plan),
            }).findOne()
            if (!plan) {
                job.fail(new Error("Plan does not exists"))
                return
            }
            const diffInDate = differenceInDays(
                new Date(),
                new Date(String(subscription?.expiresAt))
            )
            if (diffInDate <= 1) {
                const paystackDeduct = await new Paystack().chargeCard(
                    user.email,
                    Number(plan?.amount),
                    String(card?.authorizationCode),
                    createReference("SUB")
                )
                const dataToProcess = await composeCardPayment(
                    user,
                    plan,
                    card,
                    paystackDeduct
                )
                await Promise.all(dataToProcess)
            }
        }
        done()
    })
}

export const deactivateSubscription = async (agenda: Agenda) => {
    agenda.define(
        Queue_Identifier.DEACTIVATE_SUBSCRIPTION,
        async (job, done) => {
            const { userId: id } = job.attrs.data
            const user = await new UserService({ id }).findOne()
            if (user) {
                const [subscription] = await Promise.all([
                    new SubscriptionService({
                        id: user.subscriptionId,
                    }).findOne(),
                ])
                if (!subscription)
                    job.fail(new Error("Subscription does not exist"))
                const plan = await new PlanService({
                    id: String(subscription?.plan),
                }).findOne()
                if (!plan) {
                    job.fail(new Error("Plan does not exists"))
                    return
                }
                const diffInDate = differenceInDays(
                    new Date(),
                    new Date(String(subscription?.expiresAt))
                )
                if (diffInDate <= 0) {
                    await new SubscriptionService({
                        id: subscription?.id,
                    }).update({ isActive: false })
                    await new UserService({
                        id
                    }).update({ subscriptionId: "" })
                }
            }
            done()
        }
    )
}

export const subscribeAfterPayment = async (agenda: Agenda) => {
    agenda.define(Queue_Identifier.INITIATE_SUBSCRIPTION, async (job, done) => {
        const { reference, planId, user } = job.attrs.data
        const subscription = await new SubscriptionService({
            plan: planId,
            reference,
            userId: user.id,
        }).findOne()

        if (subscription)
            throw catchError("Subscription already processed", 400)

        const paystack = await new Paystack(reference).verifyTransaction()

        if (!paystack)
            throw catchError(
                "We're unable to process your payment. Please contact support if issue persist!"
            )

        const [card, plan] = await Promise.all([
            new CardService({
                lastFour: paystack.authorization.last4,
                userId: user.id,
            }).findOne(),
            new PlanService({ id: planId }).findOne(),
        ])

        if (!plan) throw catchError("Invalid Plan selected", 400)

        const dataToProcess = await composeCardPayment(
            user,
            plan,
            card,
            paystack
        )
        await Promise.all(dataToProcess)
        await agenda.schedule(
            `${plan.interval === "monthly" ? "in one month" : "in one year"}`,
            Queue_Identifier.RENEW_SUBSCRIPTION,
            { userId: user.id }
        )
        await agenda.schedule(
            `${plan.interval === "monthly" ? "in one month" : "in one year"}`,
            Queue_Identifier.DEACTIVATE_SUBSCRIPTION,
            { userId: user.id }
        )
        done()
    })
}
