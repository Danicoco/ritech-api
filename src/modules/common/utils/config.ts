/** @format */

import { catchError } from "./index"

export const validateEnvs = (values: string[]) => {
    return values.map(value => {
        if (typeof process.env[value] !== "string") {
            throw catchError(`Add ${value} to env`)
        }
        return value
    })
}

const getEnv = (key: string) => String(process.env[key])

export const configs = {
    PORT: getEnv("PORT"),
    DB_NAME: getEnv("DB_NAME"),
    NODE_ENV: getEnv("NODE_ENV"),
    BACKEND_URL: getEnv("BACKEND_URL"),
    ENCRYPTIONIV: getEnv("ENCRYPTIONIV"),
    MONGO_DB_URL: getEnv("MONGO_DB_URL"),
    PAYSTACK_PROD_PUBLIC_KEY: getEnv("PAYSTACK_PROD_PUBLIC_KEY"),
    PAYSTACK_PUBLIC_KEY: getEnv("PAYSTACK_PUBLIC_KEY"),
    PAYSTACK_ENV: getEnv("PAYSTACK_ENV"),
    PAYSTACK_URL: getEnv("PAYSTACK_URL"),
    ZEPTOMAIL_TOKEN: getEnv("ZEPTOMAIL_TOKEN"),
    ZEPTOMAIL_BASE_URL: getEnv("ZEPTOMAIL_BASE_URL"),
    PAYSTACK_SECRET: getEnv("PAYSTACK_SECRET"),
    TRADE_COPIER_AUTH: getEnv("TRADE_COPIER_AUTH"),
    TRADE_COPIER_LOGIN: getEnv("TRADE_COPIER_LOGIN"),
    TRADE_COPIER_PASSWORD: getEnv("TRADE_COPIER_PASSWORD"),
    TRADE_COPIER_BASE_URL: getEnv("TRADE_COPIER_BASE_URL"),
    TRADE_COPIER_USERNAME: getEnv("TRADE_COPIER_USERNAME"),
    TRADE_COPIER_SUB: getEnv("TRADE_COPIER_SUB"),
    PSB_PUBLIC_KEY: getEnv("PSB_PUBLIC_KEY"),
    PSB_PRIVATE_KEY: getEnv("PSB_PRIVATE_KEY"),
    PSB_BASE_URL: getEnv("PSB_BASE_URL"),
    PSB_ACCOUNT: getEnv("PSB_ACCOUNT"),
    PSB_BANK_CODE: getEnv("PSB_BANK_CODE"),
}

validateEnvs(Object.keys(configs))
