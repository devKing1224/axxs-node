"use strict";
module.exports = {
  name: "axxs_api",
  options: {
    routes: {
      prefix: "/api/v1"
    }
  },
  register: async (server, options) => {
    let pluginName = "axxs_api";
    server.route(require("./controllers/exampleController").routes);
    server.route(require("./controllers/fulfillmentController").routes);
    server.route(require("./controllers/inmateController").routes);
    server.route(require("./controllers/deviceController").routes);
    server.route(require("./controllers/serviceController").routes);
    server.route(require("./controllers/cpcController").routes);
    server.route(
      require("./controllers/inmateActivityHistoryController").routes
    );
    server.route(require("./controllers/familyController").routes);
    server.route(require("./controllers/superadminController").routes);
    server.route(require("./controllers/newsController").routes);
    server.route(require("./controllers/musicController").routes);
    server.route(require("./controllers/moviesController").routes);
    server.route(require("./controllers/timeController").routes);

    server.route({
      method: "OPTIONS",
      path: "/{p*}",
      config: {
        handler: (request, h) => {
          let response = h.response();
          response.headers["Access-Control-Allow-Headers"] =
            "Content-Type, Authorization";
          response.headers["Access-Control-Allow-Methods"] =
            "GET, POST, PUT, DELETE, OPTIONS";
          response.headers["Access-Control-Allow-Origin"] = "*";
          return response;
        },
        cors: true
      }
    });

    let getRouteParams = request => {
      if (request.route.settings.plugins[pluginName]) {
        let params = request.route.settings.plugins[pluginName];
        return params;
      }
      return null;
    };

    const onPreHandler = async (request, h) => {
      const logger = request.server.app.logger;

      const getLogFunction = level => {
        return (message, err, extraData) => {
          let logMessage = {
            level,
            message,
            requestId: request.info.id,
            ...extraData
          };
          if (err) {
            logMessage = Object.assign(logMessage, {
              stack: err.stack,
              errorMessage: err.message
            });
          }
          logger.log(logMessage);
        };
      };

      const requestLogger = {
        silly: getLogFunction("silly"),
        debug: getLogFunction("debug"),
        verbose: getLogFunction("verbose"),
        info: getLogFunction("info"),
        warn: getLogFunction("warn"),
        error: getLogFunction("error")
      };

      request.app.log = requestLogger;
      const params = getRouteParams(request);
      return h.continue;
    };

    server.ext({
      type: "onPreHandler",
      options: {
        sandbox: "plugin"
      },
      method: onPreHandler
    });
  }
};
