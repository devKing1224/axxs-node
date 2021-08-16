"use strict";
const superAdminService = require("../services/superAdminService");
const commonLang = require("../lang/en/common");
const inmateLang = require("../lang/en/inmate");
const axxsConst = require("../constants/axss");

let cpc = {};

cpc.getAPIurl = async (request, h) => {
  request.server.app.logger.info("getAPIurl");
  try {
    superAdminService.init({
      database: request.server.app.database
    });

    if (request.headers.token != axxsConst.api_token) {
      const response = h.response({
        statuscode: 400,
        Status: "Success",
        Message: "Invalid Authorization."
      });
      response.type("application/json");
      return response;
    }

    const proUrl = await superAdminService.getProAPIurlData();
    const qaUrl = await superAdminService.getQaAPIurlData();
    const testUrl = await superAdminService.getTestAPIurlData();

    const response = h.response({
      Code: 200,
      Status: commonLang.success,

      Data: {
        pro_api_url: proUrl.content,
        qa_api_url: qaUrl.content,
        test_api_url: testUrl.content
      },
      Message: inmateLang.api_url_details
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

cpc.routes = [
  {
    method: "POST",
    path: "/getapiurl",
    config: {
      handler: cpc.getAPIurl,
      cors: true
    }
  }
];

module.exports = cpc;
