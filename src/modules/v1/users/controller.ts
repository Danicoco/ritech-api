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
import { Transaction } from "sequelize"
import TradeCopier from "../../thirdpartyApi/trade-copier"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const otp = randomInt(1000, 9999)

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
            throw catchError(
                "There was an error on our end while creating your account. Please try again!",
                500
            )
        }

        await transaction.commit()

        let [userExist] = await tryPromise(
            new UserService({ email: user?.email }).findOne()
        )
        delete userExist?.password

        const token = await tokenize({
            ...userExist,
            isAdmin: userExist?.isAdmin || false,
        })

        return res
            .status(201)
            .json(
                success(
                    "Account created successfully",
                    { user: userExist, plainOtp: otp },
                    { token }
                )
            )
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
        const otp = randomInt(1000, 9999)

        const [_, error] = await tryPromise(
            new UserService({ email: req.body.email }).update({
                otp: createHash215(otp.toString()),
            })
        )

        if (error) throw catchError("Error processing your request", 400)

        // send notification

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
    try {
        let [user, error] = await tryPromise(
            new UserService({ id: req.user.id }).update(req.body)
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
    try {
        let [user, error] = await tryPromise(
            new UserService({ id: req.user.id }).delete()
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

        return res
            .status(200)
            .json(success("User record updated successfully", user))
    } catch (error) {
        next(error)
    }
}

export const createMasterAccount = async (
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
        type
    } = req.body
    try {
        if (type === "master" && !req.user.isAdmin) {
            throw catchError('Invalid Operation')
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
                    subscription: "auto",
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
