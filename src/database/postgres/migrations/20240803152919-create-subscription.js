/** @format */

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
          "ritech-subscriptions",
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
              plan: {
                  allowNull: false,
                  type: Sequelize.STRING,
              },
              isActive: {
                  allowNull: false,
                  defaultValue: true,
                  type: Sequelize.BOOLEAN,
              },
              reasonForCancellation: {
                  type: Sequelize.STRING,
              },
              paidAt: {
                  type: Sequelize.DATE,
              },
              expiresAt: {
                  type: Sequelize.DATE,
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
        await queryInterface.dropTable("ritech-subscriptions")
    },
}
