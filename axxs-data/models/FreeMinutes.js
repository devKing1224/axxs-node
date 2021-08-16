"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let FreeMinutes = sequelize.define(
    "free_minutes",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      inmate_id: {
        type: Sequelize.INTEGER
      },
      left_minutes: {
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
      underscored: true,
      freezeTableName: true
    }
  );
  return FreeMinutes;
};
