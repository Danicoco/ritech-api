/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, createReference, success, tryPromise } from "../../common/utils"
import PlanService from "../plans/service"
import { creditWallet, debitWallet, getWallet } from "./helper"
import UserService from "../users/service"
import { addMonths, addYears } from "date-fns"
import db from "../../../database/postgres/models"
import { Transaction } from "sequelize"
import SubscriptionService from "../subscriptions/service"

export const subscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { planId, } = req.body
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

        const trans = await db.sequelize.transaction({
            autocommit: false,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
            type: Transaction.TYPES.EXCLUSIVE,
        })
        await debitWallet({
            userId: String(user),
            name: `${req.user.firstName} ${req.user.lastName}`,
            session: trans,
            amount: plan.amount,
            fee: 0,
            description: ``,
            isWithdrawal: false,
            pendingTransaction: false,
            currency: 'USD',
            transactionMeta: { ...req.body, subscribe: true },
        })
        const sub = await new SubscriptionService({}).create({
            isActive: true,
            paidAt: new Date(),
            expiresAt:
                plan.interval === "monthly"
                    ? addMonths(new Date(), 1)
                    : addYears(new Date(), 1),
            plan: String(plan.id),
            reference: createReference('RIT'),
            userId: String(user.id),
        })
        await trans.commit()

        return res.status(200).json(
            success("Dynamic account available", sub)
        )
    } catch (error) {
        next(error)
    }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const currency = req.query.currency as any
    const user = req.user.id
    try {
        if (!currency) throw catchError('Currency is missing');
        let [wallet, error] = await tryPromise(
            getWallet(String(user), currency)
        )

        if (error) throw catchError("Error retrieving wallet")

        return res
            .status(200)
            .json(success("Wallet successfully retrieved", wallet))
    } catch (error) {
        next(error)
    }
}

export const convert = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user.id

    const { baseCurrency, targetCurrency, amount } = req.body
    const ngnRate = 1400
    try {
        const [baseWallet, error] = await tryPromise(
            getWallet(String(user), baseCurrency)
        )

        if (error) throw catchError("Error retrieving wallet")

        const [targetWallet, tError] = await tryPromise(
            getWallet(String(user), targetCurrency)
        )

        if (tError) throw catchError("Error retrieving wallet")

        if (Number(amount) > Number(baseWallet?.balance)) {
            throw catchError("Insufficient currency")
        }

        const amountToCredit =
            baseCurrency === "NGN"
                ? Number(amount) / ngnRate
                : Number(amount) * ngnRate

        const trans = await db.sequelize.transaction({
            autocommit: false,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
            type: Transaction.TYPES.EXCLUSIVE,
        })
        // credit target wallet
        await creditWallet({
            userId: String(user),
            session: trans,
            amount: amountToCredit,
            pendingTransaction: false,
            transactionMeta: { ...req.body, isConverted: true },
            name: `${req.user.firstName} ${req.user.lastName}`,
            currency: targetCurrency,
        })

        // debit base wallet
        await debitWallet({
            userId: String(user),
            name: `${req.user.firstName} ${req.user.lastName}`,
            session: trans,
            amount,
            fee: 0,
            description: ``,
            isWithdrawal: false,
            pendingTransaction: false,
            currency: targetCurrency,
            transactionMeta: { ...req.body, isConverted: true },
        })

        await trans.commit()

        return res
            .status(200)
            .json(success("Wallet successfully retrieved", targetWallet))
    } catch (error) {
        next(error)
    }
}
