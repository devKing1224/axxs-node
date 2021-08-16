"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let AllowUrls = sequelize.define(
    "allow_urls",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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
  return AllowUrls;
};
