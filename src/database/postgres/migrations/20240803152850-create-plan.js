/** @format */

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "ritech-plans",
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
                name: {
                    allowNull: false,
                    unique: true,
                    type: Sequelize.STRING,
                },
                amount: {
                    allowNull: false,
                    type: Sequelize.FLOAT,
                },
                interval: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                description: {
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
                indexes: [{ fields: ["id", "name"] }],
            }
        )
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("ritech-plans")
    },
}
