"use strict";
let Sequelize = require("sequelize");
module.exports = sequelize => {
  let SecurityQuestions = sequelize.define(
    "security_questions",
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      questions: {
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
  return SecurityQuestions;
};
