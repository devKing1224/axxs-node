"use strict";
const winston = require("winston");
require("winston-daily-rotate-file");
const Hapi = require("@hapi/hapi");
const Sequelize = require("sequelize");
const _ = require("lodash");
const axxsApi = require("./axxs-api");
const serverConfig = require("./config/config");

module.exports = async config => {
  try {
    const validate = async function(decoded, request, h) {
      try {
        if (!decoded) {
          return { isValid: false };
        } else {
          return { isValid: true };
        }
      } catch (e) {
        return { isValid: false };
      }
    };

    const server = Hapi.server({
      cache: require("@hapi/catbox-memory"),
      // uncomment to debug on your local
      debug: {
        request: ["*", "error", "payload", "received"]
      },
      port: 3000,
      app: {}
    });

    server.config = serverConfig;

    await server.register(require("hapi-auth-jwt2"));

    server.auth.strategy("ios", "jwt", {
      key: server.config.iosSecret,
      errorFunc: errorContext => {
        errorContext.message = null;
        return errorContext;
      },
      validate: validate
    });
    server.auth.strategy("backoffice", "jwt", {
      key: server.config.backofficeSecret,
      errorFunc: errorContext => {
        errorContext.message = null;
        return errorContext;
      },
      validate: validate // validate function defined above
    });
    await server.register(axxsApi, { routes: { prefix: "/api/v1" } });

    server.route({
      method: "GET",
      path: "/",
      handler: (request, reply) => {
        const response = reply.response("hello");
        response.type("text/plain");
        return response;
      }
    });
    server.route({
      method: "POST",
      path: "/echo",
      handler: (request, reply) => {
        logger.info(request.payload);
        let response = reply.response(request.payload);
        response.type("text/plain");
        return response;
      }
    });

    const fileTransport = new winston.transports.DailyRotateFile({
      name: "app-json-transport",
      filename: `${config.log_path}/app-axxs-api-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    });

    const consoleTransport = new winston.transports.Console({
      level: config.logLevel,
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize({ all: true }),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(info => {
          const properties = Object.getOwnPropertyNames(info);
          const ignoredProperties = [
            "timestamp",
            "level",
            "message",
            "_object",
            "annotate",
            "reformat",
            "data",
            "isBoom",
            "isServer",
            "isJoi"
          ];
          const objectProperties = ["details", "output"];
          if (info.message instanceof Object) {
            return `${info.timestamp} ${info.level} ${JSON.stringify(
              info.message
            )} : ${info.stack || ""}`;
          }
          let output = `${info.timestamp} ${info.level} ${info.message}`;
          for (const prop of properties) {
            if (_.includes(ignoredProperties, prop)) {
              continue;
            }

            if (_.includes(objectProperties, prop)) {
              output += ` ${prop}: ${JSON.stringify(info[prop])}`;
            } else {
              output += ` ${prop}: ${info[prop]}`;
            }
          }
          return output;
        })
      )
    });

    const logger = winston.createLogger({
      transports: [consoleTransport, fileTransport]
    });

    const db = new Sequelize(
      config.axxs_db.dbName,
      config.axxs_db.dbUser,
      config.axxs_db.dbPass,
      {
        host: config.axxs_db.url,
        port: config.axxs_db.port,
        dialect: config.axxs_db.dialect,
        pool: {
          max: 20,
          min: 0,
          idle: 10000
        },
        operatorsAliases: config.operatorsAliases,
        logging: function(str) {
          // suppressed logs because gross....to un-supress, uncomment the console log below.
          // logger.info(str);
        }
      }
    );
    server.app.logger = logger;
    server.app.database = require("./axxs-data/index")(db);
    server.app.database.sequelize = db;

    logger.log({ level: "info", message: "Loading loggers..." });
    logger.info(logger.transports[0].name + " logger loaded");
    logger.info(logger.transports[1].name + " logger loaded");

    logger.error("testing error logger");
    logger.debug("testing debug logger");
    logger.warn("testing warn logger");

    server.app.config = config;
    server.start();
    //server.realm.modifiers.route.prefix = "/api";
    server.app.logger.info("Server running at: " + server.info.uri);

    return server;
  } catch (e) {
    console.error("Hapi error when starting server ", e);
  }
};
