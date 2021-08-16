"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let ServiceCategory = sequelize.define(
    "service_category",
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
      icon_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_deleted: {
        type: Sequelize.TINYINT
      },
      sequence: {
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
  return ServiceCategory;
};
