"use strict";

const Hapi = require("@hapi/hapi");
const Sequelize = require("sequelize");
const config = require("./config/config");
const winston = require("winston");
require("winston-daily-rotate-file");
const util = require("util");

function getApmWrappedLogger(loggerToWrap) {
  return {
    trace: (message, ...params) =>
      loggerToWrap.debug(util.format(message, params)),
    debug: (message, ...params) =>
      loggerToWrap.debug(util.format(message, params)),
    info: (message, ...params) =>
      loggerToWrap.info(util.format(message, params)),
    warn: (message, ...params) =>
      loggerToWrap.warn(util.format(message, params)),
    error: (message, ...params) =>
      loggerToWrap.error(util.format(message, params)),
    fatal: (message, ...params) =>
      loggerToWrap.error(util.format(message, params))
  };
}

const logger = winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${config.log_path}/apm-%DATE%.log`,
      datePattern: "YYYY-MM-DD"
    })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  )
});

const apmLogger = getApmWrappedLogger(logger);

const ElasticAPM = require("elastic-apm-node");

const apm = ElasticAPM.start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: config.apm.serviceName,

  // Use if APM Server requires a token
  secretToken: config.apm.secretToken,

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: config.apm.serverUrl,
  captureBody: "all",
  logLevel: "info",
  active: config.env !== "dev",
  logger: apmLogger
});

let Server = require("./server");

Server(config).then(configuredServer => {
  if (configuredServer) {
    configuredServer.app.apm = apm;
    module.exports = configuredServer;
  }
});
