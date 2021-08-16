"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let DefaultServicePermissions = sequelize.define(
    "default_service_permissions",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      facility_id: {
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
      underscored: true
    }
  );
  return DefaultServicePermissions;
};
