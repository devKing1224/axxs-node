"use strict";
const DeviceService = require("../services/deviceService");
const axxsConst = require("../constants/axss");

let controller = {};

controller.getDeviceId = async (request, h) => {
  request.server.app.logger.info("getDeviceId");
  try {
    const { payload } = request;
    if (request.headers.token != axxsConst.api_token) {
      const response = h.response({
        statuscode: 400,
        Status: "Success",
        Message: "Invalid Authorization."
      });
      response.type("application/json");
      return response;
    }

    DeviceService.init({
      database: request.server.app.database
    });

    const deviceFacilityData = await DeviceService.getDeviceData(payload);

    if (deviceFacilityData) {
      const response = h.response({
        statuscode: 200,
        Status: "Success",
        Data: {
          device_id: deviceFacilityData.device_id,
          facility_id:deviceFacilityData.facility.facility_id        },
        Message: "Device ID"
      });
      response.type("application/json");
      return response;
    } else {
      const response = h.response({
        statuscode: 400,
        Status: "Success",
        Message: "Device is not registered."
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
    method: "POST",
    path: "/getdeviceid",
    config: {
      handler: controller.getDeviceId,
      cors: true
    }
  }
];

module.exports = controller;
