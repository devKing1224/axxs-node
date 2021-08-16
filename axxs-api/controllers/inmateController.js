"use strict";
let controller = {};
const Joi = require("@hapi/joi");
const crypto = require("crypto");
const hapi = require("@hapi/hapi");
const fs = require("fs");
const { isEmpty } = require("./../utils/");
const { axss: axssConstants } = require("./../constants/");
const InmateService = require("../services/inmateService");
const AuthenticationService = require("../services/authenticationService");
const commonLang = require("../lang/en/common");
const inmateLang = require("../lang/en/inmate");
const moment = require("moment");
const bcrypt = require("bcrypt-nodejs");
const axxsConst = require("../constants/axss");
const Boom = require('boom');

controller.authenticateInmate = async (request, h) => {
  request.server.app.logger.info("authenticateInmate");
  // business logic
  let device, userId, randomPassword;

  function respondWithBlocked(dataNew) {
    const response = h.response({
      Code: 200,
      Status: commonLang.failure,
      Data: dataNew,
      Message: inmateLang.inmate_block_status,
    });
    response.type("application/json");
    return response;
  }

  try {
    const { payload } = request;
    const serviceProps = {
      database: request.server.app.database,
    };
    InmateService.init(serviceProps);
    AuthenticationService.init(serviceProps);

    device = await InmateService.getDeviceData(payload);
    if (!device) {
      let response = h.response({
        Code: 200,
        Status: "Success",
        Message: "Device is not registered.",
      });
      response.type("application/json");
      return response;
    }
    let checkForPassword;
    if (device.dataValues.facility_id) {
      const getFacilityUserid = await InmateService.getFacilityUserId(device);
      const deviceCheck = await InmateService.deviceCheck(
        device.facility_id,
        payload
      );

      if (!deviceCheck) {
        let response = h.response({
          Code: 200,
          Status: "Success",
          Message: "Device is off.",
        });
        response.type("application/json");
        return response;
      }

      if (getFacilityUserid.facility_user_id != null) {
        checkForPassword = await AuthenticationService.checkPasswordWithFacilityUserId(
          payload,
          getFacilityUserid.facility_user_id
        );
        if (checkForPassword && checkForPassword.password) {
          if (
            checkForPassword.is_active === 0 ||
            checkForPassword.is_deleted === 1
          ) {
            let data = {};
            return respondWithBlocked(data);
          }
          const check = AuthenticationService.comparePassword(
            payload,
            checkForPassword
          );
          if (check) {
            userId = checkForPassword.dataValues.id;
          } else {
            //password incorrect
            let response = h.response({
              Code: 200,
              Status: "Failure",
              Message: "Incorrect Password",
            });
            response.type("application/json");
            return response;
          }
        } else {
          //no password found
          let response = h.response({
            Code: 200,
            Status: "Failure",
            Message: "Device is not authorized.",
          });
          response.type("application/json");
          return response;
        }
      } else {
        let response = h.response({
          Code: 200,
          Status: "Failure",
          Message: "Unable to find facility user id.",
        });
        response.type("application/json");
        return response;
      }
    } else {
      let response = h.response({
        Code: 200,
        Status: "Failure",
        Message: "No facility associated with this device.",
      });
      response.type("application/json");
      return response;
    }

    let dataNew = {};
    if (!isEmpty(device)) {
      randomPassword = crypto.randomBytes(5).toString("hex");
      device.dataValues.device_password = randomPassword;
      device.save();
      dataNew["NewPassword"] = randomPassword;
      dataNew["DeviceImei Number"] = payload.deviceimei;
    }
    // const userData = await InmateService.getUserData(userId);
    const userData = await InmateService.getLoginUserData(userId);
    // We need to update the object for the balance as a number and not as a string - should go back and refactor the model instead...
    userData.balance = parseFloat(userData.balance);

    const token = await AuthenticationService.signToken(
      userData,
      request.server.config.iosSecret
    );

    userData.api_token = token;
    userData.token = token;

    if (AuthenticationService.userIsBlocked(userData)) {
      return respondWithBlocked(dataNew);
    } else {
      if (userData.role_id == 4) {
        const getRes = await InmateService.getResponseOfLogin(
          userData,
          device,
          payload,
          dataNew,
          randomPassword,
          checkForPassword,
          request
        );
        const response = h.response(getRes);
        response.type("application/json");
        return response;
      } else if (userData.role_id == 8) {
        const getRes = await InmateService.getResponseOfStaffLogin(
          userData,
          device
        );
        const response = h.response(getRes);
        response.type("application/json");
        return response;
      } else {
        return respondWithBlocked(dataNew);
      }
    }
  } catch (e) {
    request.server.app.logger.error(e);
    const response = h.response({
      Code: 500,
      Status: "Failure",
      Message: "Error occurred while authenticating",
    });
    response.type("application/json");
    return response;
  }
};

controller.backofficeInmateBalance = async (request, h) => {
  request.server.app.logger.info(
    `Getting inmate balance for inmate: ${request.payload.inmate_id} at site ${request.payload.siteId}.`
  );
  try {
    InmateService.init({
      database: request.server.app.database,
    });
    let inmate = await InmateService.getInmateBalanceBySite(
      request.payload.inmate_id,
      request.payload.siteId
    );
    const response = h.response({
      Code: 200,
      Status: "Success",
      Message: "User balance",
      Data: {
        balance: inmate.balance,
      },
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(
      e.message || "error getting inmate balance"
    );
    let responseObject;
    if (e.message === "No inmate found") {
      responseObject = {
        Code: 478,
        Status: "Failure",
        Message: inmateLang.inmate_not_found,
      };
    } else {
      responseObject = {
        Code: 500,
        Status: "Failure",
        Message: e.message,
      };
    }
    let response = h.response(responseObject);
    response.type("application/json");
    return response;
  }
};

controller.inmateBalance = async (request, h) => {
  request.server.app.logger.info("getDeviceId");
  try {
    const { payload } = request;
    InmateService.init({
      database: request.server.app.database,
    });

    const userData = await InmateService.userInamteID(payload);
    if (!userData) {
      let response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.inmate_not_found,
      });
      response.type("application/json");
      return response;
    }

    let tabletCharge = await InmateService.getTabletCharge(userData.admin_id);
    tabletCharge = parseFloat(tabletCharge) ? parseFloat(tabletCharge) : 0.0;

    // We need to update the object for the balance as a number and not as a string - should go back and refactor the model instead...
    userData.balance = parseFloat(userData.balance);

    const response = h.response({
      Code: 200,
      Status: "Success",
      Data: {
        balance: userData.balance,
        tablet_charge: tabletCharge,
      },
      Message: "User balance",
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.getSecurityQuestion = async (request, h) => {
  request.server.app.logger.info("getSecurityQuestion");
  try {
    const { query: payload } = request;
    if (request.headers.token != axxsConst.api_token) {
      const response = h.response({
        statuscode: 400,
        Status: "Success",
        Message: "Invalid Authorization.",
      });
      response.type("application/json");
      return response;
    }
    InmateService.init({
      database: request.server.app.database,
    });

    const deviceData = await InmateService.getDeviceData(payload);

    if (!isEmpty(deviceData)) {
      var facilityUserId = (await InmateService.getFacilityUserId(deviceData))
        .dataValues.facility_user_id;
    } else {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.inmate_not_found,
      });
      response.type("application/json");
      return response;
    }

    const user = await InmateService.getFacilityUserDataByUsername(
      payload,
      facilityUserId
    );

    if (user == null || user == undefined) {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: inmateLang.user_not_found,
      });
      response.type("application/json");
      return response;
    }

    if (user.role_id == 8) {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: "facility staff cannot reset the password",
      });
      response.type("application/json");
      return response;
    }
    if (user) {
      if (payload.forgot_password && user.first_login === 0) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: inmateLang.login_error_first,
        });
        response.type("application/json");
        return response;
      }

      const securityQuestions = await InmateService.getSecurityQuestions();
      const userAnswers = await InmateService.getUsersAnswers(
        user.dataValues.id
      );

      // putting user answers into security questions
      let updatedSecurityQues = [];
      securityQuestions.forEach((securityQuestion) => {
        let secQues = { ...securityQuestion.dataValues };
        secQues.selected = false;
        delete secQues["createdAt"];
        delete secQues["updatedAt"];
        delete secQues["updated_at"];
        delete secQues["created_at"];
        userAnswers.forEach((userAnswer) => {
          if (secQues.id === userAnswer["question_id"]) {
            secQues.selected = true;
            secQues.answer = userAnswer["answer"];
          }
        });
        updatedSecurityQues.push(secQues);
      });

      let result = updatedSecurityQues.reduce((unique, o) => {
        if (!unique.some((obj) => obj.id === o.id)) {
          unique.push(o);
        }
        return unique;
      }, []);

      if (securityQuestions) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: inmateLang.question_details,
          Data: result,
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: inmateLang.inmate_not_found,
      });
      response.type("application/json");
      return response;
    }

    const response = h.response({
      Code: 200,
      Status: commonLang.success,
      Data: allowUrlsData,
      Message: "M&S URL",
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.logoutInmate = async (request, h) => {
  request.server.app.logger.info("logoutInmate");
  try {
    //pull the payload out of the request
    const { payload } = request;

    //init database service
    const serviceProps = {
      database: request.server.app.database,
    };

    //init Inmate Activity History Service
    InmateService.init(serviceProps);

    const currentSession = await InmateService.getInmateLoggedHistoryData(
      payload.api_token
    );

    if (!currentSession) {
      throw Boom.badRequest('Session does not exist for that api_token');
    }

    let startTime = new Date(currentSession.start_date_time);

    let endTime = new Date();

    if (startTime.getTime() > endTime.getTime()) {
      throw Boom.badRequest(inmateLang.inmate_logout_unsuccessful)
    }

    if (currentSession && currentSession.dataValues.end_date_time) {
      throw Boom.badRequest(inmateLang.inmate_logout_unsuccessful)
    }

    await InmateService.updateLogoutTime(payload, endTime);

    const response = h.response({
      Code: 200,
      Status: commonLang.success,
      Message: inmateLang.inmate_logout_success
    });
    response.type("application/json");
    return response;

  } catch (e) {
    request.server.app.logger.error(e);
    throw (e);
  }
};

controller.registerInmateReport = async (request, h) => {
  request.server.app.logger.info("registerinmatereport");
  try {
    const { payload } = request;

    InmateService.init({
      database: request.server.app.database,
    });

    const inmateReport = await InmateService.createInmateReport({
      inmate_id: payload["inmate_id"],
      report_time: moment().utcOffset(-5).format("MM-DD-YYYY HH:mm:ss"),
      status: axssConstants.status.block,
      is_deleted: axssConstants.active,
    });

    if (!isEmpty(inmateReport)) {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.inmate_report_success,
      });
      response.type("application/json");
      return response;
    } else {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.inmate_report_error_success,
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.checkAnswer = async (request, h) => {
  request.server.app.logger.info("checkAnswer");
  try {
    const { payload: query } = request;
    InmateService.init({
      database: request.server.app.database,
    });
    if (query.deviceimei) {
      const Device = await InmateService.getDeviceData(query);
      if (Device) {
        let getFacilityUserid = await InmateService.getFacilityUserId(Device);
        let user = await InmateService.getFacilityUserDataByUsername(
          query,
          getFacilityUserid.facility_user_id
        );

        if (user) {
          let checkAnswer = [];
          for (let value of query.Questions) {
            let userans = await InmateService.getUserAnswer(
              user.id,
              value.question_id,
              value.answer
            );
            if (userans) {
              checkAnswer.push(true);
            } else {
              checkAnswer.push(false);
            }
          }
          if (checkAnswer.indexOf(false) == -1) {
            let response = h.response({
              Code: 200,
              Status: commonLang.success,
              Message: inmateLang.check_answer,
            });
            response.type("application/json");
            return response;
          } else {
            let response = h.response({
              Code: 200,
              Status: commonLang.success,
              Message: inmateLang.check_answer_error,
            });
            response.type("application/json");
            return response;
          }
        } else {
          let response = h.response({
            Code: 400,
            Status: commonLang.success,
            Message: inmateLang.inmate_not_found,
          });
          response.type("application/json");
          return response;
        }
      } else {
        let response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: inmateLang.device_not_registered,
        });
        response.type("application/json");
        return response;
      }
    } else {
      let response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: "device imei required.",
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.saveAnswer = async (request, h) => {
  request.server.app.logger.info("saveAnswer");
  try {
    const { payload } = request;
    let userObj = {}; // get userObj from jwt
    InmateService.init({
      database: request.server.app.database,
    });
    if (!payload.user_id) {
      let response = h.response({
        Code: 400,
        error: "Bad Request",
        message: "Invalid request query input",
      });
      response.type("application/json");
      return response;
    }

    userObj.id = payload.user_id;
    await InmateService.delUserAllAns(userObj.id);

    let user = await InmateService.getUserData(userObj.id);
    if (user) {
      payload.Questions.forEach(async (value) => {
        InmateService.createUserAns(user.id, value.question_id, value.answer);
      });

      let response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.answer,
      });
      response.type("application/json");
      return response;
    } else {
      let response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: inmateLang.inmate_not_found,
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.changePassword = async (request, h) => {
  request.server.app.logger.info("changePassword");
  try {
    const { payload } = request;
    if (request.headers.token != axxsConst.api_token) {
      const response = h.response({
        statuscode: 400,
        Status: "Success",
        Message: "Invalid Authorization.",
      });
      response.type("application/json");
      return response;
    }
    InmateService.init({
      database: request.server.app.database,
    });

    const deviceData = await InmateService.getDeviceData(payload);
    if (deviceData) {
      const facilityUserId = await InmateService.getFacilityUserId(deviceData);
      const userData = await InmateService.getFacilityUserDataByUsername(
        payload,
        facilityUserId.facility_user_id
      );
      if (userData) {
        let myDate = userData.date_of_birth.split("-");
        let dobPw = myDate[1] + myDate[2] + myDate[0];
        if (payload.current_password) {
          let currentPassword = userData.password;
          if (payload.new_password != dobPw) {
            if (
              bcrypt.compareSync(
                payload.current_password,
                currentPassword.replace(/^\$2y(.+)$/i, "$2a$1")
              ) ||
              bcrypt.compareSync(payload.current_password, currentPassword)
            ) {
              let updateObj = {
                password: bcrypt.hashSync(payload.new_password),
              };
              let conditionObj = { id: userData.id };
              const updateRes = await InmateService.updateUser(
                updateObj,
                conditionObj
              );

              if (updateRes) {
                let response = h.response({
                  Code: 200,
                  Status: commonLang.success,
                  Message: inmateLang.password_changed,
                });
                response.type("application/json");
                return response;
              } else {
                let response = h.response({
                  Code: 400,
                  Status: commonLang.success,
                  Message: inmateLang.incorrect_current_password,
                });
                response.type("application/json");
                return response;
              }
            } else {
              let response = h.response({
                Code: 400,
                Status: commonLang.success,
                Message: inmateLang.incorrect_current_password,
              });
              response.type("application/json");
              return response;
            }
          }
        } else {
          if (payload.new_password != dobPw) {
            let updateObj = { password: bcrypt.hashSync(payload.new_password) };
            let conditionObj = { id: userData.id };

            if (userData.first_login === 0) {
              updateObj.first_login = 1;
            }
            const updateRes = await InmateService.updateUser(
              updateObj,
              conditionObj
            );
            if (updateRes) {
              let response = h.response({
                Code: 200,
                Status: commonLang.success,
                Message: inmateLang.password_changed,
              });
              response.type("application/json");
              return response;
            } else {
              let response = h.response({
                Code: 400,
                Status: commonLang.success,
                Message: inmateLang.incorrect_current_password,
              });
              response.type("application/json");
              return response;
            }
          } else {
            let response = h.response({
              Code: 400,
              Status: commonLang.success,
              Message: inmateLang.incorrect_current_password,
            });
            response.type("application/json");
            return response;
          }
        }
      } else {
        let response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: inmateLang.inmate_not_found,
        });
        response.type("application/json");
        return response;
      }
    } else {
      let response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: inmateLang.device_not_registered,
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.resetPassword = async (request, h) => {
  request.server.app.logger.info("resetPassword");
  try {
    const { payload } = request;
    InmateService.init({
      database: request.server.app.database,
    });

    if (payload.username) {
      const deviceData = await InmateService.getDeviceData(payload);
      if (deviceData) {
        const facilityUserId = await InmateService.getFacilityUserId(
          deviceData
        );

        let user = await InmateService.getFacilityUserDataByUsername(
          payload,
          facilityUserId.facility_user_id
        );

        if (!user) {
          let response = h.response({
            Code: 200,
            Status: commonLang.success,
            Message: inmateLang.inmate_not_found,
          });
          response.type("application/json");
          return response;
        }

        let myDate = user.date_of_birth.split("-");
        let dobPw = myDate[1] + myDate[2] + myDate[0];
        if (payload.dob == dobPw) {
          /* start code for Email Send for facility admin */
          let updateObj = {
            first_login: 0,
            password: bcrypt.hashSync(payload.dob),
          };
          let conditionObj = { id: user.id };

          const updateRes = await InmateService.updateUser(
            updateObj,
            conditionObj
          );
          if (updateRes) {
            let response = h.response({
              Code: 200,
              Status: commonLang.success,
              Message: inmateLang.password_changed,
            });
            response.type("application/json");
            return response;
          } else {
            let response = h.response({
              Code: 400,
              Status: commonLang.success,
              Message: inmateLang.incorrect_current_password,
            });
            response.type("application/json");
            return response;
          }
        }
      } else {
        let response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: inmateLang.device_not_registered,
        });
        response.type("application/json");
        return response;
      }
    }
    let response = h.response({
      Code: 400,
      Status: commonLang.failure,
      Message: commonLang.invalid_dob,
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.setUserBalance = async (request, h) => {
  request.server.app.logger.info("dummy");
  try {
    const { payload } = request;

    InmateService.init({
      database: request.server.app.database,
    });
    await InmateService.updateBalanceToZero(payload.inmate_id);
    let response = h.response({
      Code: 200,
      Status: commonLang.success,
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error("dummy request error please check");
  }
};

controller.dummy = async (request, h) => {
  request.server.app.logger.info("dummy");
  try {
    let { authUserData } = request;
    InmateService.init({
      database: request.server.app.database,
    });
    let users = await InmateService.database.Users.findAll({
      where: { id: [119, 118, 114] },
    });
    const token = await JWT.sign(
      {
        ...{
          id: 1,
          name: "Jen Jones",
        },
      },
      request.server.config.iosSecret
    );

    let userIds = [];
    for (let user of users) {
      userIds.push(user.id);
    }

    let allServicePermisson = await InmateService.database.ServicePermissions.findAll(
      {
        where: { inmate_id: userIds },
      }
    );
    let finalRes = [];
    for (let user of users) {
      let tempObj = user.dataValues;
      let tempRes = allServicePermisson.filter(
        (service) => service.inmate_id == user.id
      );
      tempObj.allService = tempRes;
      finalRes.push(tempObj);
    }
    let response = h.response({
      Code: 400,
      Status: commonLang.failure,
      Message: commonLang.invalid_dob,
      data: finalRes,
    });
    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error("dummy request error please check");
  }
};

controller.getImmortalBackofficeToken = (request, h) => {
  let token = AuthenticationService.signImmortalToken(
    request.server.config.backofficeSecret
  );
  let response = h.response({ token: token });
  return response;
};

controller.getImmortalIosToken = (request, h) => {
  let token = AuthenticationService.signImmortalToken(
    request.server.config.iosSecret
  );
  let response = h.response({ token: token });
  return response;
};

controller.storeLogs = async (request, h) => {
  try {
    const serviceProps = {
      database: request.server.app.database,
    };
    const { payload } = request;
    const paths = "/var/log/axxs-api/";
    InmateService.init(serviceProps);
    if (payload.logs && payload.inmateId) {
      let logFileName = payload.inmateId + "-" + Date.now() + "-log.txt";
      //return logFileName;
      let oldLogs = await InmateService.checkLogs(payload);
      // return oldLogs;

      // if (oldLogs) {
      //   fs.access(oldLogs, fs.F_OK, (err) => {
      //     request.server.app.logger.info(
      //       `${oldLogs} ${err ? "does not exist" : "exists"}`
      //     );
      //     if (!err) {
      //       fs.unlink(oldLogs, function (err) {
      //         if (err) return console.log(err);
      //         request.server.app.logger.info(
      //           `${oldLogs} file deleted successfully`
      //         );
      //       });
      //     }
      //   });
      // }

      // fs.writeFile(paths + logFileName, payload.logs, function (err) {
      //   if (err) {
      //     return console.log(err);
      //   }
      //   request.server.app.logger.info(
      //     `${logFileName} file created successfully`
      //   );
      // });
      function locations(substring, string) {
        let start = [],
          i = -1;
        while ((i = string.indexOf(substring, i + 1)) >= 0) start.push(i);
        return start;
      }
      const data = payload.logs;
      const start_pos = locations("JSON RESPONSE", data);
      // const end_pos = locations("})",data);
      let res = [];
      for (var i = 0; i < start_pos.length; i++) {
        var j = i + 1;
        // res.push(data.substr(start_pos[i]+15, start_pos[j]-start_pos[i]-71));
        res.push(
          data.substr(start_pos[i] - 164, start_pos[j] - start_pos[i] - 1)
        );
      }
      // console.log(res);

      let updatelogs;
      if (oldLogs) {
        for (let index = 0; index < res.length - 1; index++) {
          updatelogs = await InmateService.updateLogs(
            payload,
            res[index],
            "in"
          );
        }
        // updatelogs = await InmateService.updateLogs(
        //   payload,
        //   paths + logFileName,
        //   "up"
        // );
        request.server.app.logger.info(`${logFileName} Updated successfully`);
      } else {
        for (let index = 0; index < res.length - 1; index++) {
          updatelogs = await InmateService.updateLogs(
            payload,
            res[index],
            "in"
          );
        }
        // updatelogs = await InmateService.updateLogs(
        //   payload,
        //   paths + logFileName,
        //   "in"
        // );n
        request.server.app.logger.info(`${logFileName} created successfully`);
      }

      if (updatelogs) {
        let response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: inmateLang.log_stored,
        });

        response.type("application/json");
        return response;
      } else {
        let response = h.response({
          Code: 400,
          Status: commonLang.failure,
          Message: inmateLang.log_not_stored,
        });
        response.type("application/json");
        return response;
      }
    } else {
      let response = h.response({
        Code: 400,
        Status: commonLang.failure,
        Message: inmateLang.log_not_stored,
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
    let response = h.response({
      Code: 400,
      Status: commonLang.failure,
      Message: inmateLang.log_not_stored,
    });
    response.type("application/json");
    return response;
  }
};

controller.routes = [
  {
    method: "POST",
    path: "/logininmate",
    config: {
      handler: controller.authenticateInmate,
      validate: {
        payload: Joi.object({
          email: Joi.string().trim().required(),
          password: Joi.string().trim().required(),
          deviceimei: Joi.string().trim().required(),
          app_version: Joi.string().optional(),
        }),
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/inmatebalance",
    config: {
      handler: controller.inmateBalance,
      validate: {
        payload: Joi.object({
          inmate_id: Joi.any().required(),
        }),
      },
      auth: {
        strategies: ["ios", "backoffice"],
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/backofficeinmatebalance",
    config: {
      handler: controller.backofficeInmateBalance,
      validate: {
        payload: Joi.object({
          inmate_id: Joi.any().required(),
          siteId: Joi.any().required(),
        }),
      },
      auth: {
        strategies: ["backoffice"],
      },
      cors: true,
    },
  },
  {
    method: "GET",
    path: "/getsecurityquestion",
    config: {
      handler: controller.getSecurityQuestion,
      validate: {
        query: Joi.object({
          deviceimei: Joi.string().trim().required(),
          username: Joi.string().trim().optional(),
          forgot_password: Joi.string().trim().optional(),
        }),
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/logoutinmate",
    config: {
      handler: controller.logoutInmate,
      auth: {
        strategies: ["ios", "backoffice"],
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/registerinmatereport",
    config: {
      handler: controller.registerInmateReport,
      validate: {
        payload: Joi.object({
          inmate_id: Joi.any().required(),
        }),
      },
      auth: {
        strategies: ["ios", "backoffice"],
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/checkanswer",
    config: {
      handler: controller.checkAnswer,
      validate: {
        payload: Joi.object({
          deviceimei: Joi.string().trim().required(),
          username: Joi.string().trim().optional(),
          Questions: Joi.any().required(),
        }),
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/saveanswer",
    config: {
      handler: controller.saveAnswer,
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/changepassword",
    config: {
      handler: controller.changePassword,
      validate: {
        payload: Joi.object({
          username: Joi.string().trim().required(),
          deviceimei: Joi.string().trim().required(),
          new_password: Joi.string().trim().optional(),
          confirm_password: Joi.string().trim().optional(),
          current_password: Joi.string().trim().optional(),
        }),
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/resetpassword",
    config: {
      handler: controller.resetPassword,
      validate: {
        payload: Joi.object({
          username: Joi.string().trim().required(),
          dob: Joi.string().trim().required(),
          deviceimei: Joi.string().trim().required(),
          key: Joi.any().optional(),
        }),
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/dummy",
    config: {
      handler: controller.dummy,
      cors: true,
    },
  },
  {
    method: "GET",
    path: "/backofficeDonkey",
    config: {
      handler: controller.getImmortalBackofficeToken,
      cors: true,
    },
  },
  {
    method: "GET",
    path: "/iosDonkey",
    config: {
      handler: controller.getImmortalIosToken,
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/set_user_balance",
    config: {
      handler: controller.setUserBalance,
      validate: {
        payload: Joi.object({
          inmate_id: Joi.any().required(),
        }),
      },
      auth: {
        strategies: ["ios", "backoffice"],
      },
      cors: true,
    },
  },
  {
    method: "POST",
    path: "/store_logs",
    config: {
      payload: {
        maxBytes: 10 * 1000 * 1000,
      },
      handler: controller.storeLogs,
      auth: {
        strategies: ["ios", "backoffice"],
      },
    },
  },
];

module.exports = controller;
