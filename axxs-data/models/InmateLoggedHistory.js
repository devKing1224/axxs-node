"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let InmateLoggedHistory = sequelize.define(
    "inmate_logged_history",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      api_token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      device_id: {
        type: Sequelize.STRING
      },
      inmate_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      charges: {
        type: Sequelize.DOUBLE
      },
      start_date_time: {
        type: Sequelize.DATE
      },
      end_date_time: {
        type: Sequelize.DATE
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
      freezeTableName: true,
      timestamps: false
    }
  );
  return InmateLoggedHistory;
};
