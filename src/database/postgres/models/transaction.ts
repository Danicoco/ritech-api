/** @format */

import { Model, DataTypes, Sequelize } from "sequelize"
import { makePaginate } from "sequelize-cursor-pagination"

import { ITransaction } from "../../../types"

interface TransactionInstance extends Model<ITransaction>, ITransaction {}

export default function Transaction(sequelize: Sequelize) {
    const Transaction = sequelize.define<TransactionInstance, ITransaction>(
        "ritech-transactions",
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
            user: {
                allowNull: false,
                type: DataTypes.UUID,
            },
            amount: {
                defaultValue: 0,
                type: DataTypes.FLOAT,
            },
            fee: {
                defaultValue: 0,
                type: DataTypes.FLOAT,
            },
            currency: {
                type: DataTypes.STRING,
            },
            wallet: {
                type: DataTypes.UUID,
            },
            status: {
                type: DataTypes.STRING,
            },
            type: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
            },
            reference: {
                type: DataTypes.STRING,
            },            
            meta: {
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
            indexes: [{ fields: ["id"] }],
        }
    )

    //@ts-ignore
    Transaction.paginate = makePaginate(Transaction)
    return Transaction
}
