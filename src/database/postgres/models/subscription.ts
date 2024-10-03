/** @format */

import { Model, DataTypes, Sequelize } from "sequelize"
import { makePaginate } from "sequelize-cursor-pagination"

import { ISubscription } from "../../../types"
import Plan from "./plan"

interface SubscriptionInstance extends Model<ISubscription>, ISubscription {}

export default function Subscription(sequelize: Sequelize) {
    const Subscription = sequelize.define<SubscriptionInstance, ISubscription>(
        "ritech-subscriptions",
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
            plan: {
                allowNull: false,
                type: DataTypes.STRING,
                references: {
                    model: Plan(sequelize),
                    key: 'id',
                }
            },
            isActive: {
                allowNull: false,
                defaultValue: true,
                type: DataTypes.BOOLEAN,
            },
            reasonForCancellation: {
                type: DataTypes.STRING,
            },
            paidAt: {
                type: DataTypes.DATE,
            },
            expiresAt: {
                type: DataTypes.DATE,
            },
            reference: {
                type: DataTypes.STRING,
            },
            userId: {
                type: DataTypes.UUID,
            },
            ritechPlanId: {
                type: DataTypes.UUID,
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
            indexes: [{ fields: ["id"] }],
        }
    )

    //@ts-ignore
    Subscription.paginate = makePaginate(Subscription)
    return Subscription
}
