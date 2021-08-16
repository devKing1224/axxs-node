"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Movies = sequelize.define(
    "movies",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING
      },
      logo_url: {
        type: Sequelize.STRING,
        unique: true
      },
      img_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      movie_url: {
        type: Sequelize.STRING,
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
  return Movies;
};
