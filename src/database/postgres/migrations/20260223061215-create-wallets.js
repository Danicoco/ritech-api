/** @format */

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "ritech-wallets",
            {
                id: {
                    unique: true,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    validate: {
                        isUUID: {
                            args: 4,
                            msg: "id must be uuid",
                        },
                    },
                },
                user: {
                    allowNull: false,
                    type: Sequelize.UUID,
                },
                balance: {
                    defaultValue: 0,
                    type: Sequelize.FLOAT,
                },
                ledgerBalance: {
                    defaultValue: 0,
                    type: Sequelize.FLOAT,
                },
                currency: {
                    type: Sequelize.STRING,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                deletedAt: {
                    type: Sequelize.DATE,
                },
            },
            {
                paranoid: true,
                updatedAt: true,
                deletedAt: true,
                indexes: [{ fields: ["id"] }],
            }
        )
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("ritech-wallets")
    },
}
