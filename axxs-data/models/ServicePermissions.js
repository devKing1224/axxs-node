"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let ServicePermissions = sequelize.define(
    "service_permissions",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      inmate_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_default: {
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
      underscored: true
    }
  );
  return ServicePermissions;
};
