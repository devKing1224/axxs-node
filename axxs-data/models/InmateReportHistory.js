"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let InmateReportHistory = sequelize.define(
    "inmate_report_history",
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
      report_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      view: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      active_time: {
        type: Sequelize.STRING
      },
      is_deleted: {
        type: Sequelize.BOOLEAN
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
  return InmateReportHistory;
};
