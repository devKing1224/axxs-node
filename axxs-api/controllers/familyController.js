"use strict";
const FamilyService = require("../services/familyService");
const { isEmpty } = require("../utils/");
const commonLang = require("../lang/en/common");
const paymentHistoryLang = require("../lang/en/paymentHistory");

let controller = {};

controller.getPaymentInformation = async (request, h) => {
  request.server.app.logger.info("getPaymentInformation");
  try {
    const {
      params: { familyId }
    } = request;

    FamilyService.init({
      database: request.server.app.database
    });

    const paymentInformationData = await FamilyService.getPaymentInformationData(
      familyId
    );
    if (!isEmpty(paymentInformationData)) {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Data: paymentInformationData,
        Message: paymentHistoryLang.payment_get_data
      });
      response.type("application/json");
      return response;
    }

    const response = h.response({
      Code: 400,
      Status: commonLang.success,
      Message: paymentHistoryLang.payment_does_not_have_data
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
    path: "/getpaymentinformation/{familyId}",
    config: {
      handler: controller.getPaymentInformation,
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  }
];

module.exports = controller;
