/** @format */

import { Model, DataTypes, Sequelize } from "sequelize"
import { makePaginate } from "sequelize-cursor-pagination"

import { ICard } from "../../../types"

interface CardInstance extends Model<ICard>, ICard {}

export default function Card(sequelize: Sequelize) {
    const Card = sequelize.define<CardInstance, ICard>(
        "ritech-cards",
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
                type: DataTypes.STRING,
            },
            bin: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            type: {
                type: DataTypes.STRING,
            },
            bank: {
                type: DataTypes.STRING,
            },
            userId: {
                type: DataTypes.STRING,
            },
            lastFour: {
                type: DataTypes.STRING,
            },
            reusable: {
                type: DataTypes.BOOLEAN,
            },
            signature: {
                type: DataTypes.STRING,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
            },
            expiryDate: {
                type: DataTypes.STRING,
            },
            countryCode: {
                type: DataTypes.STRING,
            },
            authorizationCode: {
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
            indexes: [{ fields: ["id", "userId"] }],
        }
    )

    //@ts-ignore
    Card.paginate = makePaginate(Card)
    return Card
}
