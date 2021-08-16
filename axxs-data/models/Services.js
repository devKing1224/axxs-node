"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Services = sequelize.define(
    "services",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      service_category_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      base_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.INTEGER
      },
      charge: {
        type: Sequelize.DECIMAL(13,2),
        allowNull: false
      },
      flat_rate: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      flat_rate_charge: {
        type: Sequelize.DECIMAL(13,2),
        allowNull: false
      },
      auto_logout: {
        type: Sequelize.TINYINT
      },
      msg: {
        type: Sequelize.TEXT
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false
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
  return Services;
};
