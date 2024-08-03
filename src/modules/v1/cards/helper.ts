/** @format */

import { Request } from "express"
import { ICard, IPaymentLink } from "../../../types"
import CardService from "./service"
import StashService from "../stash/service"
import { catchError } from "../../common/utils"
import TransactionService from "../transactions/service"
import SettlementService from "../settlements/service"
import { configs } from "../../common/utils/config"
import { paystackCharge } from "../../common/charges/paystack.charges"

export const composeCardPayment = async (
    req: Request,
    card: ICard | null,
    paymentLink: IPaymentLink | null,
    paystack: Record<string, any>
) => {
    const { firstName, lastName, _id } = req.user
    let data

    const amountPaid = Number(paystack.amount) / 100
    const feeProcessed = Number(paymentLink?.charge) / 100
    const amount = paystackCharge.removeFeeFromPayment(amountPaid, feeProcessed)
    const stash = await new StashService({ userId: _id }).findOne()
    if (!stash) throw catchError("Error processing payment", 400)

    if (card) {
        data = [
            new CardService().create({
                isActive: true,
                isDefault: false,
                userId: String(_id),
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
            }),
            new StashService({ _id: stash._id }).update({
                balance: Number(stash.balance) + amount,
                ledgerBalance: Number(stash.ledgerBalance) + amount,
            }),
            new TransactionService().create({
                amount,
                commission: 0,
                provider: "bloc",
                fee: paystack?.fee || 0,
                status: "successful",
                source: "Fund Account",
                reference: paystack.reference,
                userId: stash?.userId,
                type: "credit",
            }),
            new SettlementService({}).create({
                amount,
                // @ts-ignore
                items: paystack,
                status: "pending",
                userId: stash.userId,
                linkId: paystack?.reference,
                thirdPartyId: paystack?.reference,
                provider: "paystack",
                reference: paystack?.reference,
                customerId: stash.userId,
                environment:
                    configs.PAYSTACK_ENV === "production"
                        ? "production"
                        : "test",
                providerName: "paystack",
                organizationId:
                    configs.PAYSTACK_ENV === "production"
                        ? configs.PAYSTACK_SECRET
                        : configs.PAYSTACK_SECRET,
                type: "credit",
            }),
        ]
    } else {
        data = [
            new StashService({ _id: stash._id }).update({
                balance: Number(stash.balance) + amount,
                ledgerBalance: Number(stash.ledgerBalance) + amount,
            }),
            new TransactionService().create({
                amount,
                commission: 0,
                provider: "paystack",
                fee: paystack?.fee || 0,
                status: "successful",
                source: "Fund Account",
                reference: paystack.reference,
                userId: stash?.userId,
                type: "credit",
            }),
            new SettlementService({}).create({
                amount,
                // @ts-ignore
                items: paystack,
                status: "successful",
                userId: stash.userId,
                linkId: paystack?.reference,
                thirdPartyId: paystack?.reference,
                provider: "paystack",
                reference: paystack?.reference,
                customerId: stash.userId,
                environment:
                    configs.PAYSTACK_ENV === "production"
                        ? "production"
                        : "test",
                providerName: "paystack",
                organizationId:
                    configs.PAYSTACK_ENV === "production"
                        ? configs.PAYSTACK_SECRET
                        : configs.PAYSTACK_SECRET,
                type: "credit",
            }),
        ]
    }

    return data
}
