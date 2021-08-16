"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Facilities = sequelize.define(
    "facilitys",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      facility_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      facility_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      facility_admin: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      cpc_funding: {
        type: Sequelize.BOOLEAN
      },
      cntct_approval: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      device_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      tablet_charges: {
        type: Sequelize.TINYINT
      },
      twilio_number: {
        type: Sequelize.STRING
      },
      free_minutes: {
        type: Sequelize.INTEGER
      },
      terms_condition: {
        type: Sequelize.TEXT
      },
      address_line_1: {
        type: Sequelize.STRING
      },
      address_line_2: {
        type: Sequelize.STRING
      },
      location: {
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
      total_inmate: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      show_email: {
        type: Sequelize.BOOLEAN
      },
      remember_token: {
        type: Sequelize.STRING
      },
      facility_user_id: {
        type: Sequelize.INTEGER
      },
      tablet_charge: {
        type: Sequelize.FLOAT
      },
      email_charges: {
        type: Sequelize.FLOAT
      },
      create_email: {
        type: Sequelize.BOOLEAN
      },
      incoming_email_charge: {
        type: Sequelize.FLOAT
      },
      sms_charges: {
        type: Sequelize.FLOAT
      },
      in_sms_charge: {
        type: Sequelize.FLOAT
      },
      attachment_charge: {
        type: Sequelize.FLOAT
      },
      welcome_msg: {
        type: Sequelize.TEXT
      },
      is_deleted: {
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
  return Facilities;
};
