"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
    let PurchaseInmates = sequelize.define(
        "purchase_inmates",
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            siteId: {
                type: Sequelize.STRING,
                allowNull: false
            },
            product: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            customerTransactionId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            purchaseDate: {
                type: Sequelize.STRING,
                allowNull: false
            },
            apin: {
                type: Sequelize.STRING,
                allowNull: false
            },
            paymentType: {
                type: Sequelize.STRING,
                allowNull: false
            },
            amount: {
                type: Sequelize.DECIMAL(8, 2),
                allowNull: false
            },
            transactionId: {
                type: Sequelize.STRING,
                allowNull: false
            },
            createdAt: {
                name: "created_at",
                type: Sequelize.DATE,
                field: "created_at"

            },
            updatedAt: {
                name: "updated_at",
                type: Sequelize.DATE,
                field: "updated_at"
            }
        },
        {
            underscored: false,
            freezeTableName: true
        }
    );
    return PurchaseInmates;
};
