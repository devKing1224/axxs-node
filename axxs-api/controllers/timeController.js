"use strict";
const { axss: axssConstants } = require("../constants/");
const UserService = require("../services/userService");
const InmateService = require("../services/inmateService");
const AuthenticationService = require("../services/authenticationService");
const InmateActivityHistoryService = require("../services/inmateActivityHistoryService");
const Joi = require("@hapi/joi");
const Boom = require('boom');

let controller = {};

controller.checkFlatPaid = async (request, h) => {
  request.server.app.logger.info("checkFlatPaid");
  try {
    //pull the payload out of the request
    const { payload } = request;

    //init database service
    const serviceProps = {
      database: request.server.app.database,
    };

    //init Inmate Service
    InmateService.init(serviceProps);

    const flatRatePaid = await InmateService.checkFlatPaid(payload.inmate_id, payload.service_id);

    const response = h.response({
      Code: 200,
      Status: "Check balance for paid service",
      Message: "Success",
      Data: {
        paid: flatRatePaid,
      },
    });
    response.type("application/json");

    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
}

controller.checkBalanceForPaid = async (request, h) => {
  request.server.app.logger.info("checkBalanceForPaid");
  try {
    const user = await this.database.Users.findOne({
      where: {
        id: request.payload.inmate_id
      }
    });

    const response = h.response({
      Code: 200,
      Status: "Check enough balance",
      Message: "Success",
      Data: {
        enough: user.balance >= request.payload.cost,
        balance: user.balance
      },
    });
    response.type("application/json");

    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
}

controller.spendminute = async (request, h) => {
  request.server.app.logger.info("spendminute");
  try {
    //pull the payload out of the request
    const { payload } = request;

    //init database service
    const serviceProps = {
      database: request.server.app.database,
    };

    //init Inmate Activity History Service
    InmateActivityHistoryService.init(serviceProps);

    // Get the service history entry
    const serviceHistoryData = await InmateActivityHistoryService.getServiceHistoryData(
      {
        id: payload.service_history_id
      }
    );

    //init Inmate Service
    InmateService.init(serviceProps);

    // Get the global configs
    const globalConfigs = await InmateService.getGlobalConfigurations();

    // Are all devices disabled globally?
    const globalDevicesOn = globalConfigs.find(
      (el) => el.key === axssConstants.device_off_key
    );
    if (parseInt(globalDevicesOn.content) == 0) {
      throw Boom.forbidden('Devices have been disabled globally.');
    };

    // Get the inmate's data
    const userData = await InmateService.getLoginUserData(serviceHistoryData.inmate_id);

    //init Authentication Service
    AuthenticationService.init(serviceProps);

    // Do a sanity check that the user is active
    if (AuthenticationService.userIsBlocked(userData)) {
      throw Boom.forbidden('This user is disabled');
    };

    // Get the facility's data
    const facilityData = await InmateService.getFacilityByAdminId(userData.admin_id)

    // Are devices disabled at this facility?
    if (!facilityData.device_status) {
      throw Boom.forbidden('Devices have been disabled for this facility.');
    };

    // Calculate how many free minutes an inmate should receive prioritize facility value over global
    const globalFreeMinutes = globalConfigs.find(
      (el) => el.key === axssConstants.free_minutes_key
    );
    const availableFreeMinutes = parseInt(facilityData.free_minutes) || parseInt(globalFreeMinutes["value"]);

    // Get the inmate remaining free minute balance and assign it to the userData object
    let freeMinutesRemaining = await InmateService.freeMinutesRemaining(userData.id, availableFreeMinutes);
    userData["active_free_minutes"] = freeMinutesRemaining;

    // We need to update the userData object for the balance as a number and not as a string - should go back and refactor the model instead...
    userData.balance = parseFloat(userData.balance);

    // Does the user have enough balance to pay for another minute?
    if (serviceHistoryData.type == 1 && userData.balance < serviceHistoryData.rate && userData.active_free_minutes == 0) {
      throw Boom.forbidden('User does not have enough balance to spend another minute.');
    }
    if (serviceHistoryData.type != 1 && userData.balance < serviceHistoryData.rate) {
      throw Boom.forbidden('User does not have enough balance to spend another minute.');
    }

    // Spend a minute
    const spendMinute = await InmateActivityHistoryService.spendMinute(userData, serviceHistoryData);

    // Convert to a hapi response and update type, then return
    const response = h.response(spendMinute);
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
    throw (e);
  }
}

controller.routes = [
  {
    method: "POST",
    path: "/timeapi/checkflatpaid",
    config: {
      handler: controller.checkFlatPaid,
      validate: {
        payload: Joi.object({
          inmate_id: Joi.any().required(),
          service_id: Joi.any().required()
        })
      },
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  },
  {
    method: "POST",
    path: "/timeapi/checkbalanceforpaid",
    config: {
      handler: controller.checkBalanceForPaid,
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  },
  {
    method: "POST",
    path: "/timeapi/spendminute",
    config: {
      handler: controller.spendminute,
      validate: {
        payload: Joi.object({
          service_history_id: Joi.any().required()
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