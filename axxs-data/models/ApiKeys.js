"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
    let ApiKeys = sequelize.define(
        "api_keys",
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            api_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            api_key: {
                type: Sequelize.STRING,
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
    return ApiKeys;
};
