"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Devices = sequelize.define(
    "devices",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      imei: {
        type: Sequelize.STRING
      },
      app_version_date: {
        type: Sequelize.STRING
      },
      update_app: {
        type: Sequelize.BOOLEAN
      },
      facility_id: {
        type: Sequelize.INTEGER
      },
      device_provider: {
        type: Sequelize.STRING
      },
      is_deleted: {
        type: Sequelize.BOOLEAN
      },
      device_password: {
        type: Sequelize.STRING
      },
      device_id: {
        type: Sequelize.STRING
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
      underscored: true
    }
  );
  return Devices;
};
