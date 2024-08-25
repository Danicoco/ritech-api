/** @format */

import { Router } from "express"
import {
    createCopierSchema,
    createSchema,
    forgetPasswordSchema,
    loginSchema,
    updateProfileSchema,
    validateOtpSchema,
} from "./validation"
import { Authenticate, validate } from "../../common/utils"
import { validateExistingUser } from "./middleware"
import {
    changePassword,
    create,
    createTraderAccount,
    forgetPassword,
    get,
    login,
    remove,
    resendOTP,
    update,
    validateOTP,
    verifyLogin,
} from "./controller"

const userRouter = Router({ caseSensitive: true, strict: true })

userRouter.post("/login", loginSchema, validate, login)
userRouter.post("/", createSchema, validate, validateExistingUser, create)
userRouter.post("/admin", createSchema, validate, validateExistingUser, create)
userRouter.patch("/change-password", loginSchema, validate, changePassword)
userRouter.post("/validate-otp", validateOtpSchema, validate, validateOTP)
userRouter.post(
    "/forget-password",
    forgetPasswordSchema,
    validate,
    forgetPassword
)
userRouter.post("/resend-otp", forgetPasswordSchema, validate, resendOTP)
userRouter.post("/verify-login", validateOtpSchema, validate, verifyLogin)
userRouter.patch("/profile", Authenticate, updateProfileSchema, validate, update)
userRouter.delete("/", Authenticate, remove)
userRouter.get("/profile", Authenticate, get)
userRouter.post("/copier-account", Authenticate, createCopierSchema, validate, createTraderAccount)

export default userRouter
