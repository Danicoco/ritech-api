/** @format */

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
          "ritech-cards",
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
                type: Sequelize.STRING,
            },
            bin: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            type: {
                type: Sequelize.STRING,
            },
            bank: {
                type: Sequelize.STRING,
            },
            userId: {
                type: Sequelize.STRING,
            },
            lastFour: {
                type: Sequelize.STRING,
            },
            reusable: {
                type: Sequelize.BOOLEAN,
            },
            signature: {
                type: Sequelize.STRING,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
            },
            expiryDate: {
                type: Sequelize.STRING,
            },
            countryCode: {
                type: Sequelize.STRING,
            },
            authorizationCode: {
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
            indexes: [{ fields: ["id", "userId"] }],
        }
        )
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("ritech-cards")
    },
}
