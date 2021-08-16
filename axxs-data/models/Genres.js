"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
    let Genres = sequelize.define(
        "music_genres",
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            genres: {
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
    return Genres;
};
