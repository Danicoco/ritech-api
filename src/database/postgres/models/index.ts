/** @format */

import { Sequelize } from "sequelize"

import dbconfig from "../config/config"

import User from "./user"

const { NODE_ENV = "development" } = process.env

export const config = (dbconfig as any)[NODE_ENV]

let sequelize: Sequelize
if (config.use_env_variable) {
    sequelize = new Sequelize(
        (process.env as any)[config.use_env_variable],
        config
    )
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    )
}

const db = {
    sequelize,
    Sequelize,
    user: User(sequelize),
    // transaction: Transaction(sequelize),
}

Object.keys(db).forEach((modelName: string) => {
    if ((db as any)[modelName].associate) {
        (db as any)[modelName].associate(db);
    }
})

export default db
