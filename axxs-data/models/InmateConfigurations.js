"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let InmateConfigurations = sequelize.define(
    "inmate_configurations",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2)
      },
      content: {
        type: Sequelize.TEXT
      },
      is_active: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      is_deleted: {
        type: Sequelize.TINYINT
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
  return InmateConfigurations;
};
