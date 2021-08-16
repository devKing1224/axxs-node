"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Roles = sequelize.define(
    "roles",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      guard_name: {
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
      underscored: true
    }
  );
  return Roles;
};
