"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let FlatRateServices = sequelize.define(
    "flat_rate_services",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        unique: true
      },
      service_id: {
        type: Sequelize.INTEGER,
        unique: true
      },
      flate_rate: {
        type: Sequelize.DECIMAL(13,2),
        unique: true
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
  return FlatRateServices;
};
