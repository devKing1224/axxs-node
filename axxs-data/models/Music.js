"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let Music = sequelize.define(
    "musics",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      song: {
        type: Sequelize.STRING
      },
      song_url: {
        type: Sequelize.STRING,
        unique: true
      },
      song_file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      artist: {
        type: Sequelize.STRING,
        allowNull: false
      },
      genre: {
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
  return Music;
};
