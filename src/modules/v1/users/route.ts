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
    fetch,
    forgetPassword,
    get,
    getDashboardData,
    login,
    remove,
    resendOTP,
    update,
    validateOTP,
    verifyAccount,
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
userRouter.patch("/profile/:id", Authenticate, updateProfileSchema, validate, update)
userRouter.delete("/", Authenticate, remove)
userRouter.delete("/:id", Authenticate, remove)
userRouter.get("/profile", Authenticate, get)
userRouter.get("/", Authenticate, fetch)
userRouter.get("/dashboard", Authenticate, getDashboardData)
userRouter.post("/copier-account", Authenticate, createCopierSchema, validate, createTraderAccount)
userRouter.patch("/verify-account", validateOtpSchema, validate, verifyAccount)

export default userRouter
