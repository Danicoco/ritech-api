/** @format */

import { Model, DataTypes, Sequelize } from "sequelize"
import { makePaginate } from "sequelize-cursor-pagination"

import { IUser } from "../../../types"

interface UserInstance extends Model<IUser>, IUser {}

export default function User(sequelize: Sequelize) {
    const User = sequelize.define<UserInstance, IUser>(
        "ritech-users",
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
            firstName: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            lastName: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            email: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING,
            },
            phoneNumber: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING,
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            otp: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            subscriptionId: {
                type: DataTypes.STRING,
            },
            hasMFA: {
                allowNull: false,
                defaultValue: false,
                type: DataTypes.BOOLEAN,
            },
            verified: {
                allowNull: false,
                defaultValue: false,
                type: DataTypes.BOOLEAN,
            },
            isAdmin: {
                allowNull: false,
                defaultValue: false,
                type: DataTypes.BOOLEAN,
            },
            meta: {
                allowNull: true,
                type: DataTypes.JSON,
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
            indexes: [{ fields: ["id", "phoneNumber", "email"] }],
        }
    )

    //@ts-ignore
    User.paginate = makePaginate(User)
    return User
}
