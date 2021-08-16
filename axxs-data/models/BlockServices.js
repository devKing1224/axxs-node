"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let BlockServices = sequelize.define(
    "block_services",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      inmate_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.TINYINT,
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
  return BlockServices;
};
