/** @format */

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "ritech-users",
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
                firstName: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                lastName: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                email: {
                    allowNull: false,
                    unique: true,
                    type: Sequelize.STRING,
                },
                phoneNumber: {
                    allowNull: false,
                    unique: true,
                    type: Sequelize.STRING,
                },
                password: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                otp: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                hasMFA: {
                    allowNull: false,
                    defaultValue: false,
                    type: Sequelize.BOOLEAN,
                },
                meta: {
                    allowNull: false,
                    type: Sequelize.JSON,
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
                indexes: [{ fields: ["id", "phoneNumber", "email"] }],
            }
        )
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("user")
    },
}
