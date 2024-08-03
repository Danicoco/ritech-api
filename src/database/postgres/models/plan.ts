/** @format */

import { Model, DataTypes, Sequelize } from "sequelize"
import { makePaginate } from "sequelize-cursor-pagination"

import { IPlan } from "../../../types"

interface PlanInstance extends Model<IPlan>, IPlan {}

export default function Plan(sequelize: Sequelize) {
    const Plan = sequelize.define<PlanInstance, IPlan>(
        "ritech-plans",
        {
            id: {
                unique: true,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: "id must be uuid",
                    },
                },
            },
            name: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING,
            },
            amount: {
                allowNull: false,
                type: DataTypes.FLOAT,
            },
            interval: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
            },
            currency: {
                type: DataTypes.STRING,
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            deletedAt: {
                type: DataTypes.DATE,
            },
        },
        {
            paranoid: true,
            updatedAt: true,
            deletedAt: true,
            indexes: [{ fields: ["id", "name"] }],
        }
    )

    //@ts-ignore
    Plan.paginate = makePaginate(Plan)
    return Plan
}
