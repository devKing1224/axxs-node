"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let PaymentInformations = sequelize.define(
    "payment_information",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      family_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      payment_status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      client_email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      client_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      inmate_id: {
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      payemet_details: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        name: "created_at",
        type: Sequelize.DATE
      },
      updated_at: {
        name: "updated_at",
        type: Sequelize.DATE
      }
    },
    {
      underscored: true,
      freezeTableName: true
    }
  );
  return PaymentInformations;
};
