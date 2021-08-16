"use strict";
let Sequelize = require("sequelize");
module.exports = (db_connection) => {
  const models = {
    Users: require("./models/Users")(db_connection),
    Devices: require("./models/Devices")(db_connection),
    Facilities: require("./models/Facilities")(db_connection),
    InmateConfigurations: require("./models/InmateConfigurations")(
      db_connection
    ),
    ServiceBooks: require("./models/ServiceBooks")(db_connection),
    AllowUrls: require("./models/AllowUrls")(db_connection),
    SecurityQuestions: require("./models/SecurityQuestions")(db_connection),
    Services: require("./models/Services")(db_connection),
    UserAnswers: require("./models/UserAnswers")(db_connection),
    InmateActivityHistory: require("./models/InmateActivityHistory")(
      db_connection
    ),
    PaymentInformations: require("./models/PaymentInformations")(db_connection),
    ServiceChargeByFacilities: require("./models/ServiceChargeByFacilities")(
      db_connection
    ),
    FlatRateServices: require("./models/FlatRateServices")(db_connection),
    ServiceHistory: require("./models/ServiceHistory")(db_connection),
    InmateLoggedHistory: require("./models/InmateLoggedHistory")(db_connection),
    Families: require("./models/Families")(db_connection),
    InmateChargesHistory: require("./models/InmateChargesHistory")(
      db_connection
    ),
    InmateReportHistory: require("./models/InmateReportHistory")(db_connection),
    ServiceCategory: require("./models/ServiceCategory")(db_connection),
    ServicePermissions: require("./models/ServicePermissions")(db_connection),
    BlockServices: require("./models/BlockServices")(db_connection),
    UserToken: require("./models/UserToken")(db_connection),
    PurchaseInmates: require("./models/PurchaseInmates")(db_connection),
    FreeMinutes: require("./models/FreeMinutes")(db_connection),
    Roles: require("./models/Roles")(db_connection),
    Movies: require("./models/Movies")(db_connection),
    NewsSettings: require("./models/NewsSettings")(db_connection),
    ApiKeys: require("./models/ApiKeys")(db_connection),
    DefaultServicePermissions: require("./models/DefaultServicePermissions")(
      db_connection
    ),
    EstimateServiceUse: require("./models/EstimateServiceUse")(db_connection),
    Music: require("./models/Music")(db_connection),
    Genres: require("./models/Genres")(db_connection),
    UserLogs: require("./models/UserLogs")(db_connection),
  };

  Object.keys(models).forEach(function (modelName) {
    if ("associate" in models[modelName]) {
      models[modelName].associate(models);
    }
  });

  models.sequelize = db_connection;
  models.Sequelize = Sequelize;
  models.Sequelize.Op = Sequelize.Op;

  return models;
};
