/** @format */

import { ICard, IPlan, IUser, StaticVirtualAccount } from "../../../types"
import { createReference } from "../../common/utils"
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

type Props = {
    user: IUser;
    amount: number;
    description: string;
    accountNumber: string;
    bankCode: string;
    fee: number;
}

export const composeVirtual = ({ user, amount, description, accountNumber, bankCode, fee }: Props): StaticVirtualAccount => {
    return {
        transaction: {
            reference: createReference('RIT'),
        },
        order: {
            amount,
            country: 'NGA',
            currency: 'NGN',
            description,
            amounttype: 'EXACT'
        },
        customer: {
            account: {
                name: `${user.firstName} ${user.lastName}`,
                type: 'DYNAMIC',
                expiry: {
                    hours: 1,
                }
            }
        },
        beneficiarytocredit: {
            accountumber:accountNumber,
            bankcode: bankCode,
            feeamount: Number(fee)
        }
    }
}