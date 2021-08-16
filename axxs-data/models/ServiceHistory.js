"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let ServiceHistory = sequelize.define(
    "service_history",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      inmate_activity_history_id: {
        type: Sequelize.INTEGER
      },
      inmate_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.INTEGER
      },
      duration: {
        type: Sequelize.INTEGER
      },
      rate: {
        type: Sequelize.DECIMAL(13, 2)
      },
      charges: {
        type: Sequelize.DECIMAL(13, 2),
        allowNull: false
      },
      free_minutes_used: {
        type: Sequelize.INTEGER
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
  return ServiceHistory;
};
