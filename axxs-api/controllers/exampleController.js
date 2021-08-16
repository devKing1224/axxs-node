"use strict";
const UserService = require("../services/userService");
let controller = {};

controller.foo = async (request, h) => {
  request.server.app.logger.info("foo");
  let user;
  try {
    UserService.init({
      database: request.server.app.database,
      logger: request.server.app.logger
    });
    user = await UserService.getUserById(100);
  } catch (e) {
    request.server.app.logger.error(e);
  }

  let response = h.response({ user: user });
  response.type("application/json");
  return response;
};

controller.routes = [
  {
    method: "get",
    path: "/foo",
    config: {
      handler: controller.foo,
      cors: true
    }
  }
];

module.exports = controller;
