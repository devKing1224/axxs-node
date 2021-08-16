"use strict";
const { isEmpty } = require("../utils/");
const ServiceService = require("../services/serviceService");
const serviceBooksLang = require("../lang/en/serviceBooks");
const commonLang = require("../lang/en/common");
const serviceLang = require("../lang/en/service");
const Joi = require("@hapi/joi");
let controller = {};

controller.getAllServiceBooks = async (request, h) => {
  request.server.app.logger.info("getAllServiceBooks");
  try {
    ServiceService.init({
      database: request.server.app.database
    });

    const allServiceBooksData = await ServiceService.getAllServiceBooksData();

    if (!isEmpty(allServiceBooksData)) {
      const response = h.response({
        Code: 200,
        Status: serviceBooksLang.service_books_details,
        Data: allServiceBooksData,
        Message: commonLang.success
      });
      response.type("application/json");
      return response;
    } else {
      const response = h.response({
        Code: 200,
        Status: serviceBooksLang.service_books_not_found,
        Message: commonLang.success,
        Data: []
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.getInmateService = async (request, h) => {
  request.server.app.logger.info("getInmateService");
  try {
    const { query } = request;
    ServiceService.init({
      database: request.server.app.database
    });

    let inmateId = query.inmate_id;
    const userData = await ServiceService.getUserData(inmateId);
    if (userData) {
      if (userData.role_id == 8) {
        let getFacilityUserid = await ServiceService.getFacilityUserId(
          userData.admin_id
        );
        if (!getFacilityUserid) {
          const response = h.response({
            Code: 200,
            Status: serviceLang.service_not_found,
            Message: commonLang.service_not_found
          });
          response.type("application/json");
          return response;
        }
        inmateId = getFacilityUserid.facility_user_id;
      }
      let inmateServiceInfo = await ServiceService.getInmateServiceInfo(
        inmateId,
        userData.role_id
      );
      let allCategory = await ServiceService.getserviceall(
        inmateId,
        inmateServiceInfo,
        userData.role_id
      );

      // For each category, if it has subcategories, iterate over them and convert their flat_rate_charge and charge to float as decimal from MySQL is returning as string
      allCategory.Category = allCategory.Category.map(function(el) {
        if (typeof el.subcategory == "object") {
          el.subcategory = el.subcategory.map(function(el) {
            el.flat_rate_charge = parseFloat(el.flat_rate_charge);
            el.charge = parseFloat(el.charge);
            return el;
          });
        }
        if (typeof el.flat_rate_charge == "string") {
          el.flat_rate_charge = parseFloat(el.flat_rate_charge);
        }
        if (typeof el.charge == "string") {
          el.charge = parseFloat(el.charge);
        }
        return el;
      });
      inmateId = query.inmate_id;
      //checking if user services are blocked
      let check_blockservice = await ServiceService.isServiceblock(inmateId);
      if (check_blockservice) {
        allCategory["block_service"] = {};
        allCategory["block_service"].is_block = true;
      } else {
        allCategory["block_service"] = {};
        allCategory["block_service"].is_block = false;
      }
      allCategory["block_service"]["msg"] =
        "All Services are blocked Please contact administrator";

      if (inmateServiceInfo.length > 0) {
        const response = h.response({
          Code: 200,
          Status: serviceLang.service_details,
          Data: allCategory,
          Message: commonLang.success
        });
        response.type("application/json");
        return response;
      } else {
        const response = h.response({
          Code: 200,
          Status: serviceLang.service_not_found,
          Message: commonLang.service_not_found
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 200,
        Status: serviceLang.service_not_found,
        Message: commonLang.service_not_found
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.routes = [
  {
    method: "GET",
    path: "/getallservicebooks",
    config: {
      handler: controller.getAllServiceBooks,
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  },
  {
    method: "GET",
    path: "/getinmateservice",
    config: {
      handler: controller.getInmateService,
      validate: {
        query: Joi.object({
          inmate_id: Joi.string()
            .trim()
            .required()
        })
      },
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  }
];

module.exports = controller;
