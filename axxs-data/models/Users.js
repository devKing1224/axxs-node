"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Users = sequelize.define(
    "users",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      inmate_id: {
        type: Sequelize.STRING
      },
      admin_id: {
        type: Sequelize.STRING
      },
      api_token: {
        type: Sequelize.STRING
      },
      last_login_history: {
        type: Sequelize.STRING
      },
      device_id: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      middle_name: {
        type: Sequelize.STRING
      },
      user_image: {
        type: Sequelize.STRING
      },
      balance: {
        type: Sequelize.FLOAT
      },
      status: {
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      date_of_birth: {
        type: Sequelize.DATEONLY
      },
      role_id: {
        type: Sequelize.INTEGER
      },
      is_active: {
        type: Sequelize.TINYINT
      },
      is_log: {
        type: Sequelize.TINYINT
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
        type: Sequelize.STRING
      },
      is_deleted: {
        type: Sequelize.BOOLEAN
      },
      remember_token: {
        type: Sequelize.STRING
      },
      first_login: {
        type: Sequelize.TINYINT
      },
      location: {
        type: Sequelize.STRING
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
  return Users;
};
