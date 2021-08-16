"use strict";
const CpcService = require("../services/cpcService");
const commonLang = require("../lang/en/common");

let controller = {};

controller.getAllowUrls = async (request, h) => {
  request.server.app.logger.info("getAllowUrls");
  try {
    CpcService.init({
      database: request.server.app.database
    });

    const allowUrlsData = await CpcService.getAllowUrlsData();

    const response = h.response({
      Code: 200,
      Status: commonLang.success,
      Data: allowUrlsData,
      Message: "M&S URL"
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.routes = [
  {
    method: "GET",
    path: "/allowurl",
    config: {
      handler: controller.getAllowUrls,
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  }
];

module.exports = controller;
