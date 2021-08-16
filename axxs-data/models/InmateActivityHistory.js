"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let InmateActivityHistory = sequelize.define(
    "inmate_activity_history",
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
      inmate_logged_history_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      exit_reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      start_datetime: {
        type: Sequelize.STRING,
        allowNull: true
      },
      end_datetime: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        name: "created_at",
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        name: "updated_at",
        type: Sequelize.DATE,
        allowNull: true
      }
    },
    {
      underscored: true,
      freezeTableName: true
    }
  );
  return InmateActivityHistory;
};
