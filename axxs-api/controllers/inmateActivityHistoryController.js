"use strict";
const crypto = require("crypto");
const moment = require("moment");
const inmateLang = require("../lang/en/inmate");
const { isEmpty, strtotime, round, intval, bin2hex } = require("../utils");
const inmateActivityLang = require("../lang/en/inmateActivity");
const commonLang = require("../lang/en/common");
const { axss: axssConstants } = require("../constants/");
const InmateService = require("../services/inmateService");
const AuthenticationService = require("../services/authenticationService");
const InmateActivityHistoryService = require("../services/inmateActivityHistoryService");
const Joi = require("@hapi/joi");
const Boom = require('boom');

let controller = {};

controller.getInmateActivityDetails = async (request, h) => {
  request.server.app.logger.info("getInmateActivityDetails");
  try {
    const { query } = request;

    InmateActivityHistoryService.init({
      database: request.server.app.database
    });

    let inmateActivityHistoryData = await InmateActivityHistoryService.getInmateActivityHistoryNew(
      query.inmate_id
    );
    inmateActivityHistoryData = inmateActivityHistoryData.map(function(el) {
      el.charges = parseFloat(el.charges);
      return el;
    });

    if (inmateActivityHistoryData) {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.inmate_details,
        Data: inmateActivityHistoryData
      });
      response.type("application/json");
      return response;
    } else {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.inmate_not_found,
        Data: []
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.registerInmateStartTimeActivityHistory = async (request, h) => {
  request.server.app.logger.info("registerInmateStartTimeActivityHistory");
  try {
    //pull the payload out of the request
    const { payload } = request;

    //generate a UTC Timestamp
    const currDateTimeStamp = moment().utc().format("YYYY-MM-DD HH:mm:ss");

    //init database service
    const serviceProps = {
      database: request.server.app.database,
    };

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
    const userData = await InmateService.getLoginUserData(payload.inmate_id);

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

    //init Inmate Activity History Service
    InmateActivityHistoryService.init(serviceProps);

    // Get service data
    const serviceData = await InmateActivityHistoryService.getServiceData(
      payload
    );

    // Get and set the service type, charge, and message if set for facility
    const facilityServiceChargeData = await InmateActivityHistoryService.getFacilityServiceChargeData(
      payload
    );
    if (facilityServiceChargeData) {
      serviceData.type = facilityServiceChargeData.type;
      serviceData.charge = facilityServiceChargeData.charge;
      serviceData.msg = facilityServiceChargeData.service_msg;
    }

    // If the service is a facility rate (type 1) set the rate to the facility rate, or a premium service (type 2) add the facility charge rate to the service charge rate, else wise set the rate to 0 (for free services, in case dataset is wonky)
    if (serviceData.type == 1) {
      serviceData.charge = parseFloat(facilityData.tablet_charge);
    } else if (serviceData.type == 2) {
      serviceData.charge = parseFloat(serviceData.charge) + parseFloat(facilityData.tablet_charge);
    } else {
      serviceData.charge = 0;
    }

    // If the service has a flat rate, check if the inmate has already paid it
    let flatRatePaid = false;
    if (serviceData.flat_rate == 1) {
      flatRatePaid = await InmateService.checkFlatPaid(userData.id, payload.service_id);
    }
    serviceData.flatRatePaid = flatRatePaid;

    // Does the user have enough balance to: pay the flat fee (if not paid), and/or pay the first minute (or use a free minute) and enter the service?
    if (serviceData.flat_rate == 1 && !flatRatePaid && serviceData.type == 1 && userData.active_free_minutes == 0 && userData.balance < parseFloat(serviceData.flat_rate_charge) + serviceData.charge) {
      throw Boom.forbidden('User does not have enough balance to enter service.');
    }
    if (serviceData.flat_rate == 1 && !flatRatePaid && serviceData.type == 1 && userData.active_free_minutes > 0 && userData.balance < parseFloat(serviceData.flat_rate_charge)) {
      throw Boom.forbidden('User does not have enough balance to enter service.');
    }
    if (serviceData.flat_rate == 1 && !flatRatePaid && serviceData.type != 1 && userData.balance < parseFloat(serviceData.flat_rate_charge) + serviceData.charge) {
      throw Boom.forbidden('User does not have enough balance to enter service.');
    }
    if (serviceData.type == 1 && userData.balance < serviceData.charge && userData.active_free_minutes == 0) {
      throw Boom.forbidden('User does not have enough balance to enter service.');
    }
    if (serviceData.type != 1 && userData.balance < serviceData.charge) {
      throw Boom.forbidden('User does not have enough balance to enter service.');
    }

    // Create the InmateActivityHistory entry, ServiceHistory entry, pay the flatfee if neccessary, and charge the first minute if neccessary
    const enterService = await InmateActivityHistoryService.enterService(userData, serviceData, currDateTimeStamp);

    // Convert to a hapi response and update type, then return
    const response = h.response(enterService);
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
    throw e;
  }
};

controller.registerInmateEndTimeActivityHistory = async (request, h) => {
  request.server.app.logger.info("registerInmateEndTimeActivityHistory");
  try {
    //pull the payload out of the request
    const { payload } = request;

    //generate a UTC Timestamp
    const currDateTimeStamp = moment().utc().format("YYYY-MM-DD HH:mm:ss");

    //init database service
    const serviceProps = {
      database: request.server.app.database,
    };

    //init Inmate Activity History Service
    InmateActivityHistoryService.init(serviceProps);

    //Get the Inmate Activity History by ID
    const inmateActivityHistoryData = await InmateActivityHistoryService.getInmateActivityHistory(payload.inmate_activity_history_id);

    //Make sure the inmateActivityHistoryID is sane
    if (!inmateActivityHistoryData) {
      throw Error('Cannot find InmateActivityHistory');
    }

    //Make sure the activty has not already been ended
    if (inmateActivityHistoryData.exit_reason && inmateActivityHistoryData.end_datetime) {
      throw Boom.forbidden('Inmate Activity has already ended.');
    }

    //Get the service history for the inmate activity history
    const serviceHistoryData = await InmateActivityHistoryService.getServiceHistoryData({
      inmate_activity_history_id: payload.inmate_activity_history_id
    });

    //Make sure the inmateActivityHistoryID is sane and returns a service_history row
    if (!serviceHistoryData) {
      throw Error('Cannot find ServiceHistory');
    }

    // Update inmateActivityHistory and serviceHistory
    const endService = await InmateActivityHistoryService.endService(payload, currDateTimeStamp, serviceHistoryData);

    // Convert to a hapi response and update type, then return
    const response = h.response(endService);
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
    throw e;
  }
};

const insertEstimateserviceData = async (request, database) => {
  InmateActivityHistoryService.init({
    database: database
  });
  let timeSlots = [
    "12:01 am-2:00 am",
    "2:01 am-4:00 am",
    "4:01 am-6:00 am",
    "6:01 am-8:00 am",
    "8:01 am-10:00 am",
    "10:01 am-12:00 pm",
    "12:01 pm-2:00 pm",
    "2:01 pm-4:00 pm",
    "4:01 pm-6:00 pm",
    "6:01 pm-8:00 pm",
    "8:01 pm-10:00 pm",
    "10:01 pm-12:00 pm"
  ];
  const current_date = moment(new Date())
    .tz("America/New_York")
    .format("YYYY-MM-DD HH:mm:ss");
  const blank_slot = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const cmp_time = moment(new Date())
    .tz("America/New_York")
    .format("h:mm a");
  let slot_key = "";

  for (let i = 0; i < timeSlots.length; i++) {
    let time = timeSlots[i].split("-"),
      s_time = moment(
        new Date(
          moment(new Date())
            .tz("America/New_York")
            .format("YYYY-MM-DD ") + time["0"]
        )
      ).format("h:mm a"),
      e_time = moment(
        new Date(
          moment(new Date())
            .tz("America/New_York")
            .format("YYYY-MM-DD ") + time["1"]
        )
      ).format("h:mm a"),
      c_time = moment(
        new Date(
          moment(new Date())
            .tz("America/New_York")
            .format("YYYY-MM-DD ") + cmp_time
        )
      ).format("h:mm a");

    if (c_time > s_time && c_time < e_time) {
      slot_key = i;
      break;
    }
  }

  let get_time_slot = timeSlots[slot_key].split("-"),
    s_time = moment(
      new Date(
        moment(new Date())
          .tz("America/New_York")
          .format("YYYY-MM-DD ") + get_time_slot["0"]
      )
    ).format("YYYY-MM-DD h:mm:ss"),
    e_time = moment(
      new Date(
        moment(new Date())
          .tz("America/New_York")
          .format("YYYY-MM-DD ") + get_time_slot["1"]
      )
    ).format("YYYY-MM-DD h:mm:ss");

  let submitData = {
    facility_id: request.facility_id,
    service_id: request.service_id,
    inmate_id: request.inmate_id,
    date_time: current_date,
    date: request.date
  };

  let finalData = await InmateActivityHistoryService.createEstimateServiceUse(
    submitData,
    s_time,
    e_time
  );

  console.log(current_date);
};

controller.routes = [
  {
    method: "GET",
    path: "/getinmateactivitydetails",
    config: {
      handler: controller.getInmateActivityDetails,
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
  },
  {
    method: "POST",
    path: "/registerinmatestarttimeactivityhistory",
    config: {
      handler: controller.registerInmateStartTimeActivityHistory,
      validate: {
        payload: Joi.object({
          inmate_id: Joi.any().required(),
          service_id: Joi.any().required(),
          facility_id: Joi.any().required()
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
    path: "/registerinmateendtimeactivityhistory",
    config: {
      handler: controller.registerInmateEndTimeActivityHistory,
      validate: {
        payload: Joi.object({
          exit_reason: Joi.any().required(),
          time_of_usage: Joi.any().required(),
          inmate_activity_history_id: Joi.any().required()
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
