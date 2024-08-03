import { Agenda } from "@hokify/agenda"
import { Queue_Identifier } from "../queue/identifiers"
import UserService from "../../v1/users/service";
import SubscriptionService from "../../v1/subscriptions/service";
import { differenceInDays } from "date-fns";
import { createReference } from "../utils";
import Paystack from "../../thirdpartyApi/paystack";
import CardService from "../../v1/cards/service";
import PlanService from "../../v1/plans/service";
import { composeCardPayment } from "../../v1/subscriptions/helper";

export const renewSubscription = async (agenda: Agenda) => {
    agenda.define(
        Queue_Identifier.RENEW_SUBSCRIPTION,
        async (job, done) => {
            const { userId: id } = job.attrs.data;
            const user = await new UserService({ id }).findOne();
            if (user) {
                const [subscription, card] = await Promise.all([
                    new SubscriptionService({ id: user.subscriptionId }).findOne(),
                    new CardService({ userId: id, isActive: true }).findOne(),
                ])
                if (!subscription) job.fail(new Error("Subscription does not exist"));
                if (!card) job.fail(new Error("No card to charge"));
                const plan = await new PlanService({ id: String(subscription?.plan) }).findOne();
                if (!plan) {
                    job.fail(new Error("Plan does not exists"));
                    return;
                }
                const diffInDate = differenceInDays(new Date(), new Date(String(subscription?.expiresAt)))
                if (diffInDate <= 1) {
                    const paystackDeduct = await new Paystack().chargeCard(user.email, Number(plan?.amount), String(card?.authorizationCode), createReference('SUB'));
                    const dataToProcess = await composeCardPayment(user, plan, card, paystackDeduct);
                    await Promise.all(dataToProcess)
                }
            }
            done()
        }
    )
}