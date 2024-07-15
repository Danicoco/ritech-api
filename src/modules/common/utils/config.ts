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
    TRADE_COPIER_AUTH: getEnv("TRADE_COPIER_AUTH"),
    TRADE_COPIER_LOGIN: getEnv("TRADE_COPIER_LOGIN"),
    TRADE_COPIER_PASSWORD: getEnv("TRADE_COPIER_PASSWORD"),
    TRADE_COPIER_BASE_URL: getEnv("TRADE_COPIER_BASE_URL"),
    TRADE_COPIER_USERNAME: getEnv("TRADE_COPIER_USERNAME"),
    TRADE_COPIER_SUB: getEnv("TRADE_COPIER_SUB"),
}

validateEnvs(Object.keys(configs))
