"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let InmateChargesHistory = sequelize.define(
    "inmate_charges_history",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      inmate_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      inmate_configurations_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transaction: {
        type: Sequelize.DOUBLE
      },
      transaction_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      transaction_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
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
  return InmateChargesHistory;
};
