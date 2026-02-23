/** @format */

import { Model, DataTypes, Sequelize } from "sequelize"
import { makePaginate } from "sequelize-cursor-pagination"

import { IWallet } from "../../../types"

interface WalletInstance extends Model<IWallet>, IWallet {}

export default function Wallet(sequelize: Sequelize) {
    const Wallet = sequelize.define<WalletInstance, IWallet>(
        "ritech-wallets",
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
            balance: {
                defaultValue: 0,
                type: DataTypes.FLOAT,
            },
            ledgerBalance: {
                defaultValue: 0,
                type: DataTypes.FLOAT,
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
            indexes: [{ fields: ["id"] }],
        }
    )

    //@ts-ignore
    Wallet.paginate = makePaginate(Wallet)
    return Wallet
}
