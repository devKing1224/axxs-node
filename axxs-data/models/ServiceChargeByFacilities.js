"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let ServiceChargeByFacilities = sequelize.define(
    "service_charge_by_facilities",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      service_id: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.TINYINT
      },
      facility_id: {
        type: Sequelize.INTEGER
      },
      charge: {
        type: Sequelize.DECIMAL(13,2)
      },
      service_msg: {
        type: Sequelize.TEXT
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
  return ServiceChargeByFacilities;
};
