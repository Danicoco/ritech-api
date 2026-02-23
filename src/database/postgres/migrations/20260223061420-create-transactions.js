/** @format */

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "ritech-transactions",
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
                        amount: {
                            defaultValue: 0,
                            type: Sequelize.FLOAT,
                        },
                        fee: {
                            defaultValue: 0,
                            type: Sequelize.FLOAT,
                        },
                        currency: {
                            type: Sequelize.STRING,
                        },
                        wallet: {
                            type: Sequelize.UUID,
                        },
                        status: {
                            type: Sequelize.STRING,
                        },
                        type: {
                            type: Sequelize.STRING,
                        },
                        description: {
                            type: Sequelize.STRING,
                        },
                        reference: {
                            type: Sequelize.STRING,
                        },            
                        meta: {
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
        await queryInterface.dropTable("ritech-transactions")
    },
}
