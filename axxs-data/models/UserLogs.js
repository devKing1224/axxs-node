"use strict";
let Sequelize = require("sequelize");
module.exports = (sequelize) => {
  let UserLogs = sequelize.define(
    "userLogs",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
      },

      file: {
        type: Sequelize.STRING,
        // allowNull: false,
      },
      log_file_txt: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );
  return UserLogs;
};
