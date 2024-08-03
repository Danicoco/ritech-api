/** @format */

import { ICard, IPlan, IUser } from "../../../types"
import CardService from "../cards/service"
import SubscriptionService from "./service"
import { addMonths, addYears } from "date-fns"

export const composeCardPayment = async (
    user: IUser,
    plan: IPlan,
    card: ICard | null,
    paystack: Record<string, any>
) => {
    const { firstName, lastName, id } = user

    const data = [
        new SubscriptionService({}).create({
            isActive: true,
            paidAt: new Date(),
            expiresAt:
                plan.interval === "monthly"
                    ? addMonths(new Date(), 1)
                    : addYears(new Date(), 1),
            plan: String(plan.id),
            reference: paystack.reference,
            userId: String(user.id)
        }),
    ] as any

    if (!card) {
        data.push(
            new CardService({}).create({
                isActive: true,
                userId: String(id),
                bin: paystack.authorization.bin,
                name: `${firstName} ${lastName}`,
                bank: paystack.authorization.bank,
                lastFour: paystack.authorization.last4,
                type: paystack.authorization.card_type,
                reusable: paystack.authorization.reusable,
                signature: paystack.authorization.signature,
                countryCode: paystack.authorization.country_code,
                authorizationCode: paystack.authorization.authorization_code,
                expiryDate: `${paystack.authorization.exp_month}/${paystack.authorization.exp_year}`,
            })
        )
    }

    return data
}
