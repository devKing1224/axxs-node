"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let NewsSettings = sequelize.define(
    "news_settings",
      {
          id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              autoIncrement: true,
              primaryKey: true
          },
          facility_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true
          },
          category: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true
          },
          n_limit: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true
          },
          news_per_page: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true
          },
          allow_search: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              unique: true
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
  return NewsSettings;
};
