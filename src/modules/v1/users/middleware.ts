/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, tryPromise } from "../../common/utils"
import UserService from "./service"

export const validateExistingUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, phoneNumber, isAdmin } = req.body

        const [emailExist, emailErr] = await tryPromise(
            new UserService({ email, isAdmin }).findOne()
        )

        if (emailErr) throw catchError("Account already exist.", 400)
        const [phoneExist, phoneErr] = await tryPromise(
            new UserService({ phoneNumber }).findOne()
        )

        if (phoneErr) throw catchError("Account already exist.", 400)

        res.locals = { user: emailExist || phoneExist }
        return next()
    } catch (error) {
        next(error)
    }
}
