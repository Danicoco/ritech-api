/** @format */

import { ITransaction, IUser, StaticVirtualAccount } from "../../../types"
import { createReference } from "../../common/utils"
import { randomInt } from 'crypto';


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

const transactionReference = `ONE-${randomInt(
    1000,
    9999
)}-${new Date().getTime()}`

export const composeTransactionDoc = (
    params: Record<string, any>
): ITransaction => {
    return {
        user: params.user || params.userId || params.wallet.user,
        fee: params.fee || 0,
        amount: Number(params.amount),
        wallet: params.wallet._id || params.wallet,
        status: params.status || "pending",
        type: params.type || "debit",
        reference: transactionReference,
        currency: params.currency || "NGN",
        description:
            params.description ||
            (params.type === "debit"
                ? `You send ${params.amount} from your wallet`
                : `${params.amount} was sent to you`),
        meta: params.meta,
    }
}