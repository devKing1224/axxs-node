"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Families = sequelize.define(
    "familys",
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
      family_user_id: {
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      phone: {
        type: Sequelize.STRING
      },
      address_line_1: {
        type: Sequelize.STRING
      },
      address_line_2: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      zip: {
        type: Sequelize.INTEGER
      },
      is_deleted: {
        type: Sequelize.BOOLEAN
      },
      remember_token: {
        type: Sequelize.STRING
      },
      facility_user_id: {
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
  return Families;
};
