/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, success, tokenize, tryPromise } from "../../common/utils"
import UserService from "./service"
import {
    createHash215,
    hashPassword,
    matchPassword,
} from "../../common/hashings"
import { randomInt } from "node:crypto"
import db from "../../../database/postgres/models"
import { Op, Transaction } from "sequelize"
import TradeCopier from "../../thirdpartyApi/trade-copier"
import { configs } from "../../common/utils/config"
import sendMail from "../../common/utils/email"
import VerifyAccount from "../../common/templates/verify-account"
import ResetPassword from "../../common/templates/reset-password"
import SubscriptionService from "../subscriptions/service"
import PlanService from "../plans/service"
import { endOfMonth, startOfMonth, subMonths } from "date-fns"
import { ISubscription, IUser } from "../../../types"
import { groupByCreatedAt } from "./helper"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const otp = randomInt(1000, 9999)
        const { firstName, lastName, email } = req.body

        const transaction = await db.sequelize.transaction({
            autocommit: false,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
            type: Transaction.TYPES.EXCLUSIVE,
        })
        let [user, userErr] = await tryPromise(
            new UserService({}).create(
                {
                    ...req.body,
                    hasMFA: false,
                    otp: createHash215(otp.toString()),
                    password: hashPassword(req.body.password),
                },
                transaction
            )
        )

        if (userErr) {
            await transaction.rollback()
            console.log(userErr);
            throw catchError(
                "There was an error on our end while creating your account. Please try again!",
                500
            )
        }

        await transaction.commit()

        console.log(req.body);

        if (!req.body.isAdmin) {
            // send email
            console.log("Mail will be sent");
            sendMail({
                name: `${firstName} ${lastName}`,
                email,
                subject: `Verify your account, ${firstName}`,
                message: VerifyAccount(firstName, `${otp}`),
            })
        }

        return res.status(201).json(
            success("Account created successfully", {
                ...user,
                password: undefined,
            })
        )
    } catch (error) {
        next(error)
    }
}

export const verifyAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, otp } = req.body
    try {
        const hashedOtp = createHash215(otp)

        const [user, error] = await tryPromise(
            new UserService({ email }).findOne()
        )

        if (error) throw catchError("Error processing request")

        if (!user) throw catchError("Account does not exist", 400)

        if (user.verified) throw catchError("Account already verified", 400)

        if (hashedOtp !== user?.otp) {
            throw catchError("Invalid verification code", 400)
        }

        const [_, verifyError] = await tryPromise(
            new UserService({ id: user.id }).update({ otp: "", verified: true })
        )

        if (verifyError) throw catchError("Error verifying your account")

        return res
            .status(200)
            .json(success("Account verified successfully", {}))
    } catch (error) {
        next(error)
    }
}

//TODO: SEND SMS FOR 2FA
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password, isAdmin } = req.body
    try {
        let [userExist, error] = await tryPromise(
            new UserService({ email, isAdmin }).findOne()
        )

        if (error)
            throw catchError("We can't log you in at the moment. Try again!")

        if (!userExist) throw catchError("Invalid login credentials", 400)

        const passwordMatched = matchPassword(
            password,
            userExist?.password || ""
        )

        if (!passwordMatched) throw catchError("Invalid login credentials", 400)

        let token

        if (userExist.hasMFA) {
            // send sms
        } else {
            delete userExist.password
            token = await tokenize({
                ...userExist,
                isAdmin,
            })
        }

        delete userExist.meta?.subscription

        return res
            .status(200)
            .json(
                success(
                    "Logged in successfully",
                    userExist.hasMFA ? {} : { user: userExist },
                    { token }
                )
            )
    } catch (error) {
        next(error)
    }
}

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password, otp } = req.body
    try {
        const [user, error] = await tryPromise(
            new UserService({ email }).findOne()
        )

        if (error) throw catchError("Internal Server Error", 500)

        if (!user) throw catchError("Error processing your request", 400)

        if (createHash215(otp) !== user.otp)
            throw catchError("Kindly request for a new OTP", 400)

        const passwordMatched = matchPassword(password, user?.password || "")

        if (passwordMatched)
            throw catchError("You can't use your old password", 400)

        const [_, updateError] = await tryPromise(
            new UserService({ id: user.id }).update({
                password: hashPassword(password),
                otp: "",
            })
        )
        if (updateError) throw catchError("Internal Server Error", 500)

        return res.status(200).json(success("Password successfully set", {}))
    } catch (error) {
        next(error)
    }
}

export const forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body
    const otp = randomInt(1000, 9999)
    try {
        const [user, error] = await tryPromise(
            new UserService({ email }).findOne()
        )

        if (error) throw catchError("Error processing your request", 500)

        if (user) {
            const [_, updateError] = await tryPromise(
                new UserService({ id: user.id }).update({
                    otp: createHash215(otp.toString()),
                })
            )

            if (updateError)
                throw catchError("Error processing your request", 500)

            // send mail
            sendMail({
                name: `${user?.firstName} ${user?.lastName}`,
                email: req.body.email,
                subject: `Verify your account, ${user?.firstName}`,
                message: ResetPassword(user?.firstName, `${otp}`),
            })
        }

        return res.status(200).json(success("Mail sent", { plainOtp: otp }))
    } catch (error) {
        next(error)
    }
}

export const validateOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { otp, email } = req.body
    try {
        const convertOTP = createHash215(otp)
        const [user, error] = await tryPromise(
            new UserService({ email }).findOne()
        )

        if (error) throw catchError("Error processing request", 400)

        if (!user) throw catchError("Invalid OTP", 404)

        if (convertOTP !== user.otp) throw catchError("Invalid OTP")

        return res.status(200).json(success("OTP validated successfully", {}))
    } catch (error) {
        next(error)
    }
}

// TODO: Send Notification
export const resendOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { type = "forget-password" } = req.body
        const otp = randomInt(1000, 9999)

        const [user] = await tryPromise(
            new UserService({ email: req.body.email }).findOne()
        )

        if (!user) {
            throw catchError("Account does not exist", 400)
        }

        const [_, error] = await tryPromise(
            new UserService({ email: req.body.email }).update({
                otp: createHash215(otp.toString()),
            })
        )

        if (error) throw catchError("Error processing your request", 400)

        if (type) {
            sendMail({
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                subject: `Verify your account, ${user.firstName}`,
                message: VerifyAccount(user.firstName, `${otp}`),
            })
        } else {
            sendMail({
                name: `${user?.firstName} ${user?.lastName}`,
                email: req.body.email,
                subject: `Verify your account, ${user?.firstName}`,
                message: ResetPassword(user?.firstName, `${otp}`),
            })
        }

        return res.status(200).json(success("OTP send to email", {}))
    } catch (error) {
        next(error)
    }
}

export const verifyLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, otp } = req.body
    try {
        const [user, error] = await tryPromise(
            new UserService({ email }).findOne()
        )

        if (error) throw catchError("Error processing your request", 400)
        if (!user) throw catchError("We couldn't validate your OTP")

        if (createHash215(otp) !== user.otp) throw catchError("Invalid OTP")

        delete user.password
        const token = await tokenize({
            ...user,
            isAdmin: false,
        })

        return res
            .status(200)
            .json(success("Logged in successfully", { user }, { token }))
    } catch (error) {
        next(error)
    }
}

export const update = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params
    try {
        let [user, error] = await tryPromise(
            new UserService({ id: id || req.user.id }).update(req.body)
        )
        if (error) throw catchError("Error processing your request", 400)

        delete user?.password

        return res
            .status(200)
            .json(success("User record updated successfully", user))
    } catch (error) {
        next(error)
    }
}

export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    try {
        let [user, error] = await tryPromise(
            new UserService({ id: id || req.user.id }).delete()
        )
        if (error) throw catchError("Error processing your request", 400)

        delete user?.password

        return res
            .status(200)
            .json(success("User record updated successfully", user))
    } catch (error) {
        next(error)
    }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let [user, error] = await tryPromise(
            new UserService({ id: req.user.id }).findOne()
        )
        if (error) throw catchError("Error processing your request", 400)

        delete user?.password
        delete user?.meta?.subscription

        return res
            .status(200)
            .json(success("User retrieved successfully", user))
    } catch (error) {
        next(error)
    }
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { admin, limit, next: nextPage, prev, search } = req.query
    try {
        let [users, error] = await tryPromise(
            new UserService({}).findAll(
                {
                    ...(admin
                        ? {
                              isAdmin: true,
                          }
                        : { isAdmin: false }),
                    ...(search && {
                        [Op.or]: [
                            {
                                firstName: {
                                    [Op.iLike]: `%${search}%`,
                                },
                            },
                            {
                                lastName: {
                                    [Op.iLike]: `%${search}%`,
                                },
                            },
                            {
                                email: {
                                    [Op.iLike]: `%${search}%`,
                                },
                            },
                            {
                                phoneNumber: {
                                    [Op.iLike]: `%${search}%`,
                                },
                            },
                        ],
                    }),
                },
                Number(limit),
                String(nextPage),
                String(prev)
            )
        )
        if (error) throw catchError("Error processing your request", 400)

        return res
            .status(200)
            .json(success("Users retrieved successfully", users))
    } catch (error) {
        next(error)
    }
}

export const createTraderAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        name,
        demo,
        stopLoss,
        takeProfit,
        comment,
        emailAlert,
        smsAlert,
        login,
        password,
        broker,
        server,
        type,
    } = req.body
    try {
        if (type === "master" && !req.user.isAdmin) {
            throw catchError("Invalid Operation")
        }

        if (!req.user.isAdmin && !req.user.verified) {
            throw catchError(
                "You must verify your account before performing this action"
            )
        }
        const [account, accountError] = await tryPromise(
            new TradeCopier().createAccount(
                {
                    name,
                    broker,
                    login,
                    password,
                    server,
                    environment: demo ? "Demo" : "Real",
                    status: "1", //The account is 0=disabled, 1=enabled
                    subscription: configs.TRADE_COPIER_SUB,
                    pending: "1",
                    stop_loss: stopLoss ? "1" : "0",
                    take_profit: takeProfit ? "1" : "0",
                    comment,
                    alert_email: emailAlert ? "1" : "0",
                    alert_sms: smsAlert ? "1" : "0",
                },
                type
            )
        )

        if (accountError) {
            throw catchError("Error creating your slave account")
        }

        if (account.error) {
            throw catchError(account.error)
        }

        let [user, error] = await tryPromise(
            new UserService({ id: req.user.id }).update({ meta: account })
        )
        if (error) throw catchError("Error processing your request", 400)

        delete user?.password

        return res
            .status(200)
            .json(success("Copier account created successfully", user))
    } catch (error) {
        next(error)
    }
}

export const deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id, isAdmin } = req.user
    try {
        const [user, error] = await tryPromise(
            new UserService({ id }).findOne()
        )

        if (error)
            throw catchError("Error processing your request. Try again later")

        if (!user) throw catchError("Invalid Request.")

        if (user.meta?.account?.account_id) {
            await new TradeCopier().deleteAccount(user.meta.account.account_id)
        }

        let [_, deleteError] = await tryPromise(
            new UserService({ id: req.user.id }).delete()
        )
        if (deleteError) throw catchError("Error processing your request", 400)

        return res
            .status(200)
            .json(
                success(`${isAdmin ? "Admin" : "User"} delete successful`, {})
            )
    } catch (error) {
        next(error)
    }
}

export const getDashboardData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [
            totalAdmin,
            totalUser,
            subscribedUser,
            unSubscribedUser,
            recentSubs,
            plans,
        ] = await Promise.all([
            new UserService({ isAdmin: true }).countDocuments(),
            new UserService({ isAdmin: false }).countDocuments(),
            new SubscriptionService({}).getSubscriptions(
                true,
                startOfMonth(new Date()).toISOString(),
                endOfMonth(new Date()).toISOString()
            ),
            new SubscriptionService({}).getSubscriptions(
                true,
                startOfMonth(subMonths(new Date(), 1)).toISOString(),
                endOfMonth(subMonths(new Date(), 1)).toISOString()
            ),
            new SubscriptionService({}).findAll({}, 2),
            new PlanService({}).findAll({}, 20),
        ])

        const subscribers = subscribedUser.map(subs => {
            const plan = plans.edges.find(
                item => String(item.id) === String(subs.plan)
            )
            return { ...subs, plan }
        })

        const unsubscribers = unSubscribedUser
            .map(subs => {
                const plan = plans.edges.find(
                    item => String(item.id) === String(subs.plan)
                )
                return { ...subs, plan }
            })
            .filter(item => {
                const subscription = subscribers.find(
                    sub => String(sub.userId) === String(item.userId)
                )

                if (!subscription) return item
            })
            .filter(item => item)

        const userIds = recentSubs.edges.map(edge => String(edge.userId))

        const users = (await new UserService({}).findAll({
            // @ts-ignore
            id: { [Op.in]: userIds },
        })) as { edges: IUser[] }

        const recentSubscriptions = recentSubs.edges.map(edge => {
            const user = users.edges.find(
                (item: IUser) => String(item.id) === String(edge.userId)
            )
            const plan = plans.edges.find(
                item => String(item.id) === String(edge.plan)
            )

            return {
                ...edge,
                plan,
                userId: {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                },
            }
        })

        const actualBalance = subscribers.reduce(
            (acc, curr) => acc + Number(curr.plan?.amount || 0),
            0
        )
        const pendingBalance = unsubscribers.reduce(
            (acc, curr) => acc + Number(curr.plan?.amount || 0),
            0
        )

        let currentMonthSubscription =
            groupByCreatedAt<ISubscription>(subscribedUser)
        currentMonthSubscription = Object.keys(currentMonthSubscription).map(
            item => ({
                date: item,
                count: currentMonthSubscription[item].length,
            })
        )

        let lastMonthSubscription =
            groupByCreatedAt<ISubscription>(unSubscribedUser)
        lastMonthSubscription = Object.keys(lastMonthSubscription).map(
            item => ({ date: item, count: lastMonthSubscription[item].length })
        )

        return res.status(200).json(
            success("Dashboard records", {
                totalAdmin,
                totalUser,
                subscribedUser,
                unSubscribedUser,
                currentMonthSubscription,
                pendingBalance,
                actualBalance,
                recentSubscriptions,
                lastMonthSubscription,
            })
        )
    } catch (error) {
        next(error)
    }
}
