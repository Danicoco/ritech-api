/** @format */

import { Transaction } from "sequelize"
import { catchError, tryPromise } from "../../common/utils"
import { TRANSACTION_STATUS } from "../transactions/constant"
import { composeTransactionDoc } from "../transactions/helper"
import TransactionService from "../transactions/service"
import WalletService from "./service"

type Props = {
    userId: string
    name: string
    session: Transaction
    amount: number
    fee?: number
    description: string
    isWithdrawal: boolean
    pendingTransaction: boolean
    currency: "NGN" | "USD"
    transactionMeta?: Record<string, any>
}

export const debitWallet = async (params: Props) => {
    const { userId, session, amount, currency, fee = 0 } = params
    const totalAmount = Number(amount) + Number(fee)
    const [wallet, error] = await tryPromise(getWallet(userId, currency))

    if (error) throw catchError("Error processing request")
    if (!wallet)
        throw catchError("You cannot perform this operation at this moment")
    if (Number(totalAmount) > Number(wallet.balance))
        throw catchError("Insufficient balance")

    const trans = await new TransactionService({}).create(
        composeTransactionDoc({
            wallet,
            amount,
            fee,
            description: params.description,
            status: params.pendingTransaction
                ? TRANSACTION_STATUS.PENDING
                : TRANSACTION_STATUS.SUCCESSFUL,
            meta: params.transactionMeta,
        }),
        session
    )
    const [currentWallet] = await Promise.all([
        new WalletService({ id: wallet.id }).update(
            {
                balance: Number(
                    (Number(wallet.balance) - Number(totalAmount)).toFixed(2)
                ),
            },
            session
        ),
    ])

    return { currentWallet, trans }
}

type CreditProps = {
    userId: string
    session: Transaction
    amount: number
    pendingTransaction: boolean
    transactionMeta?: Record<string, any>
    name: string
    currency: "NGN" | "USD"
}

export const creditWallet = async (params: CreditProps) => {
    const { userId, session, amount, currency } = params
    const [wallet, error] = await tryPromise(getWallet(userId, currency))

    if (error) throw catchError("Error processing request")
    if (!wallet)
        throw catchError("You cannot perform this operation at this moment")

    const transaction = await new TransactionService({}).create(
        composeTransactionDoc({
            wallet,
            amount,
            type: "credit",
            status: params.pendingTransaction
                ? TRANSACTION_STATUS.PENDING
                : TRANSACTION_STATUS.SUCCESSFUL,
            meta: params.transactionMeta,
        }),
        session
    )
    const [currentWallet] = await Promise.all([
        new WalletService({ id: wallet.id }).update(
            {
                balance: Number(wallet.balance) + Number(amount),
            },
            session
        ),
    ])

    return { currentWallet, transaction }
}

export const getWallet = async (user: string, currency: "NGN" | "USD") => {
    let wallet = await new WalletService({ user }).findOne()
    if (!wallet) {
        wallet = await new WalletService({}).create({
            user,
            balance: 0,
            ledgerBalance: 0,
            currency,
        })
    }

    return wallet
}

export const getNairaRate = async (): Promise<number | null> => {
    try {
        const res = await fetch("https://cdn.moneyconvert.net/api/latest.json")
        const data = await res.json()
        const usdToNgn = data.rates.NGN
        return usdToNgn        
    } catch (error) {
        return null
    }
}
