"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let EstimateServiceUse = sequelize.define(
    "estimate_service_uses",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: true
      },
      facility_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      inmate_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      date: {
        type: Sequelize.STRING,
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
  return EstimateServiceUse;
};
