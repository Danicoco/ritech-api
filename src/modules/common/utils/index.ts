/** @format */

import { NextFunction, Response, Request } from "express"
import { decrytData } from "../hashings"
import {
    AppError,
    CreateErr,
    IUser,
} from "../../../types"
import Logger from "../logger"
import { randomInt } from "crypto"
import { validationResult } from "express-validator"
import { isAfter } from "date-fns"
import * as jose from "jose"

export const catchError: CreateErr = (
    message,
    code = 403,
    validations = undefined
) => {
    const err = new Error(message)
    // @ts-ignore
    err.code = code
    // @ts-ignore
    err.validations = validations
    return err
}

export const success = (msg: string, data: any, meta?: object) => ({
    data,
    status: true,
    message: msg,
    ...(meta && { meta }),
})

export const Authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const tokenKey = req.get("Authorization")
        const token = tokenKey?.split(" ")[1]
        if (!token) throw catchError("No Authorization header provided", 401)

        const user = jose.decodeJwt(token) as unknown as IUser & { exp: Date}

        if (isAfter(user.exp, new Date())) {
            throw catchError("Session expired.")
        }

        req.user = user

        return next()
    } catch (error) {
        next(error)
    }
}

export const tokenize = async (
    data: Partial<IUser> & { isAdmin: boolean },
    expiry = "1d"
) => {
    const jwk = {
        kty: "RSA",
        n: "whYOFK2Ocbbpb_zVypi9SeKiNUqKQH0zTKN1-6fpCTu6ZalGI82s7XK3tan4dJt90ptUPKD2zvxqTzFNfx4HHHsrYCf2-FMLn1VTJfQazA2BvJqAwcpW1bqRUEty8tS_Yv4hRvWfQPcc2Gc3-_fQOOW57zVy-rNoJc744kb30NjQxdGp03J2S3GLQu7oKtSDDPooQHD38PEMNnITf0pj-KgDPjymkMGoJlO3aKppsjfbt_AH6GGdRghYRLOUwQU-h-ofWHR3lbYiKtXPn5dN24kiHy61e3VAQ9_YAZlwXC_99GGtw_NpghFAuM4P1JDn0DppJldy3PGFC0GfBCZASw",
        e: "AQAB",
        d: "VuVE_KEP6323WjpbBdAIv7HGahGrgGANvbxZsIhm34lsVOPK0XDegZkhAybMZHjRhp-gwVxX5ChC-J3cUpOBH5FNxElgW6HizD2Jcq6t6LoLYgPSrfEHm71iHg8JsgrqfUnGYFzMJmv88C6WdCtpgG_qJV1K00_Ly1G1QKoBffEs-v4fAMJrCbUdCz1qWto-PU-HLMEo-krfEpGgcmtZeRlDADh8cETMQlgQfQX2VWq_aAP4a1SXmo-j0cvRU4W5Fj0RVwNesIpetX2ZFz4p_JmB5sWFEj_fC7h5z2lq-6Bme2T3BHtXkIxoBW0_pYVnASC8P2puO5FnVxDmWuHDYQ",
        p: "07rgXd_tLUhVRF_g1OaqRZh5uZ8hiLWUSU0vu9coOaQcatSqjQlIwLW8UdKv_38GrmpIfgcEVQjzq6rFBowUm9zWBO9Eq6enpasYJBOeD8EMeDK-nsST57HjPVOCvoVC5ZX-cozPXna3iRNZ1TVYBY3smn0IaxysIK-zxESf4pM",
        q: "6qrE9TPhCS5iNR7QrKThunLu6t4H_8CkYRPLbvOIt2MgZyPLiZCsvdkTVSOX76QQEXt7Y0nTNua69q3K3Jhf-YOkPSJsWTxgrfOnjoDvRKzbW3OExIMm7D99fVBODuNWinjYgUwGSqGAsb_3TKhtI-Gr5ls3fn6B6oEjVL0dpmk",
        dp: "mHqjrFdgelT2OyiFRS3dAAPf3cLxJoAGC4gP0UoQyPocEP-Y17sQ7t-ygIanguubBy65iDFLeGXa_g0cmSt2iAzRAHrDzI8P1-pQl2KdWSEg9ssspjBRh_F_AiJLLSPRWn_b3-jySkhawtfxwO8Kte1QsK1My765Y0zFvJnjPws",
        dq: "KmjaV4YcsVAUp4z-IXVa5htHWmLuByaFjpXJOjABEUN0467wZdgjn9vPRp-8Ia8AyGgMkJES_uUL_PDDrMJM9gb4c6P4-NeUkVtreLGMjFjA-_IQmIMrUZ7XywHsWXx0c2oLlrJqoKo3W-hZhR0bPFTYgDUT_mRWjk7wV6wl46E",
        qi: "iYltkV_4PmQDfZfGFpzn2UtYEKyhy-9t3Vy8Mw2VHLAADKGwJvVK5ficQAr2atIF1-agXY2bd6KV-w52zR8rmZfTr0gobzYIyqHczOm13t7uXJv2WygY7QEC2OGjdxa2Fr9RnvS99ozMa5nomZBqTqT7z5QV33czjPRCjvg6FcE",
    }
    const privateKey = await jose.importJWK(jwk, "RS256")
    const token = await new jose.SignJWT(data)
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt(new Date().getTime())
        .setExpirationTime(expiry)
        .sign(privateKey)

    return token
}

export const bodyHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bodyMethod = ["POST", "PUT", "PATCH"]
    try {
        const bodyProperties = Object.values(req.body)
        if (bodyMethod.includes(req.method) && bodyProperties.length) {
            if (!req.body.payload)
                throw catchError("Request not properly formated", 403)
            const decryptPayload = decrytData(req.body.payload)
            let parsedData = {}
            if (
                decryptPayload.startsWith('"') &&
                decryptPayload.endsWith('"')
            ) {
                parsedData = JSON.parse(JSON.parse(decryptPayload))
            } else {
                parsedData = JSON.parse(decryptPayload)
            }
            req.body = {
                ...parsedData,
            }
        }
        return next()
    } catch (error) {
        next(error)
    }
}

export const errorHandler = (
    error: AppError,
    req: any,
    res: Response,
    _next: any
) => {
    try {
        let code = error.code || 500
        let msg = error.message

        if (error.name === "MongoServerError") {
            if (error.code === 11000) {
                if (
                    error.message.includes("users") &&
                    error.message.includes("email_1_phoneNumber_1 dup key")
                ) {
                    code = 422
                    msg = "Your account already exists. Kindly login"
                } else {
                    msg = "Duplicate Error"
                    code = 422
                }
            }
        }

        console.log(error.name || "Error", error.message)
        Logger.addLog("error", "GENERAL ERROR", error)

        return res.status(code).json({ status: false, message: msg })
    } catch (e) {
        return res.status(500).json({ status: false })
    }
}

export function generateRandomDigit(min: number, max: number) {
    return randomInt(min, max)
}

export const replacePlaceholders = (
    template: string,
    data: Record<string, string>
) => {
    return template.replace(
        /{(.*?)}/g,
        (match, key) => data[key.trim()] || match
    )
}

export const isItemInString = (item: string, str: string) => {
    const regex = new RegExp(`{${item}}`, "g")
    return regex.test(str)
}

export const calculatePercentage = (part: number, total: number) => {
    if (total === 0) {
        return 0 // To avoid division by zero
    }

    return Number((part / total) * 100).toFixed(2)
}

export const processSum = (arr: Array<number>) => {
    const sum = arr.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    )

    return sum
}

export const createReference = (name: string) => {
    return `${name.toUpperCase()}-${randomInt(
        111111111,
        999999999
    )}-${new Date().getTime()}`
}

export const tryPromise = async <T>(
    data: Promise<T>
): Promise<[T | null, null | string]> => {
    try {
        const result = await data
        return [result, null]
    } catch (error: any) {
        return [null, error.message]
    }
}

export const validate = (req: Request, _res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            return next()
        }

        const message = errors.array({ onlyFirstError: true })
        console.log(message, req.url)

        throw catchError(message[0].msg, 400)
    } catch (e) {
        return next(e)
    }
}

export const snakeToCamel = (snakeCase: string) => {
    return snakeCase.replace(/_([a-z])/g, function (match, letter) {
        return letter.toUpperCase()
    })
}
