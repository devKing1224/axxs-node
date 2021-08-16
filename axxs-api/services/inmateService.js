const { strtotime, isEmpty } = require("../utils/");
const { axss: axssConstants } = require("../constants/");
const mailService = require("./mailService");
const moment = require("moment");
const commonLang = require("../lang/en/common");
const inmateLang = require("../lang/en/inmate");

class InmateService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getActiveUserBalance(payload) {
    const userBalanceData = await this.database.Users.findOne({
      where: { id: payload.inmate_id, is_deleted: axssConstants.active },
      attributes: ["balance"],
    });

    return userBalanceData;
  }

  async getInmateBalanceBySite(inmateId, siteId) {
    let inmate = await this.database.sequelize.query(
      "select * from facilitys f join users u on u.admin_id = f.facility_user_id where u.username = :inmate_id and f.facility_id = :siteId",
      {
        replacements: {
          inmate_id: inmateId,
          siteId: siteId,
        },
        model: this.database.Users,
        mapToModel: true,
      }
    );

    if (!inmate.length) {
      throw new Error("No inmate found");
    }
    return inmate[0];
  }

  async getDeviceData(payload) {
    const deviceData = await this.database.Devices.findOne({
      where: { imei: payload.deviceimei },
    });

    return deviceData;
  }

  async getFacilityUserId(deviceData) {
    const facilityUserId = await this.database.Facilities.findOne({
      where: { id: deviceData.facility_id },
      attributes: ["facility_user_id"],
    });
    return facilityUserId;
  }

  async facilityDeviceStatus(facilityId) {
    const facilityDevice = await this.database.Facilities.findOne({
      where: { id: facilityId },
      attributes: ["device_status"],
    });

    return facilityDevice;
  }

  async getFacilityUserDataByRole(payload, roleId) {
    const userData = await this.database.Users.findOne({
      where: {
        username: payload.email,
        role_id: roleId,
      },
    });
    return userData;
  }

  async getFacilityUserData(payload, adminId) {
    const userData = await this.database.Users.findOne({
      where: {
        username: payload.email,
        admin_id: adminId,
      },
    });
    return userData;
  }

  async getFacilityUserDataByUsername(payload, adminId) {
    const userData = await this.database.Users.findOne({
      where: {
        username: payload.username,
        admin_id: adminId,
      },
    });
    return userData;
  }

  async getUserData(userId) {
    const userData = await this.database.Users.findOne({
      where: { id: userId },
    });

    return userData;
  }
  async getLoginUserData(userId) {
    const userData = await this.database.Users.findOne({
      attributes: [
        "id",
        "inmate_id",
        "admin_id",
        "api_token",
        "last_login_history",
        "device_id",
        "balance",
        "status",
        "username",
        "role_id",
        "first_login",
        "location",
        "is_active",
        "is_log",
      ],
      where: { id: userId },
    });

    return userData;
  }

  async getUserDataByUsername(username) {
    const userData = await this.database.Users.findOne({
      where: { username },
    });

    return userData;
  }

  async getUserDataByRole(payload, role) {
    const userData = await this.database.Users.findOne({
      where: { username: payload.email, role_id: role },
    });

    return userData;
  }

  async isInmateActive(userId) {
    const userData = await this.database.Users.findOne({
      where: { id: userId },
    });

    return userData;
  }
  async getSecurityQuestions() {
    const securityQuestionsData = await this.database.SecurityQuestions.findAll();

    return securityQuestionsData;
  }

  async getUsersAnswers(userId) {
    const userAnswersData = await this.database.UserAnswers.findAll({
      where: { user_id: userId },
    });

    return userAnswersData;
  }

  async getInmateLoggedHistoryData(token) {
    const inmateLoggedHistoryData = await this.database.InmateLoggedHistory.findOne(
      {
        where: {
          api_token: token,
        },
      }
    );
    return inmateLoggedHistoryData;
  }

  static async checkLoggedTimeCurDate(inmateId, db) {
    const currentdate = moment().utcOffset(-5).format("YYYY-MM-DD HH:mm:ss");
    const currentTime = strtotime(currentdate);

    const firstHalfStart =
      moment().utcOffset(-5).format("YYYY-MM-DD") + " 00:00:00";
    const firstHalfEnd =
      moment().utcOffset(-5).format("YYYY-MM-DD") + " 11:59:59";
    const startTime = strtotime(firstHalfStart);
    const endTime = strtotime(firstHalfEnd);

    const secondHalfStart =
      moment().utcOffset(-5).format("YYYY-MM-DD") + " 12:00:00";
    const secondHalfEnd =
      moment().utcOffset(-5).format("YYYY-MM-DD") + " 23:59:59";

    if (startTime <= currentTime && currentTime <= endTime) {
      const result = await db.InmateLoggedHistory.findOne({
        where: {
          inmate_id: inmateId,
          start_date_time: {
            $gte: firstHalfStart,
            $lte: firstHalfEnd,
          },
        },
        order: [["id", "DESC"]],
      });
      return result;
    } else {
      const result = await db.InmateLoggedHistory.findOne({
        where: {
          inmate_id: inmateId,
          start_date_time: {
            $gte: secondHalfStart,
            $lte: secondHalfEnd,
          },
        },
        order: [["id", "DESC"]],
      });
      return result;
    }
  }

  async updateLogoutTime(payload, endTimeStamp) {
    const inmateLoggedHistoryData = await this.database.InmateLoggedHistory.update(
      {
        end_date_time: endTimeStamp
      },
      {
        where: {
          api_token: payload.api_token,
        },
      }
    );
    return inmateLoggedHistoryData;
  }

  async calculateLoginTime(payload) {
    const result = await this.database.InmateLoggedHistory.findOne({
      where: {
        inmate_id: payload["inmate_id"],
        end_date_time: {
          $ne: null,
        },
        api_token: payload.api_token,
      },
      attributes: [
        [
          this.database.sequelize.fn(
            "timestampdiff",
            this.database.sequelize.literal("second"),
            this.database.sequelize.col("start_date_time"),
            this.database.sequelize.col("end_date_time")
          ),
          "total",
        ],
      ],
      order: [["id", "DESC"]],
    });
    return result;
  }

  /**
   * Function to calculation time logged time
   *
   * @param object $divisor $dividend
   *
   * @return array
   */
  async calculateLoggedChargeDub(divisor, tabletCharge, inmateId) {
    const freeTabletCharge = await this.database.InmateConfigurations.findOne({
      where: {
        id: axssConstants.tablet_charges,
        is_deleted: axssConstants.active,
      },
    });

    const facilityCharge = await this.database.sequelize.query(
      "select `facilitys`.`tablet_charge`, `users`.`inmate_id` as `inmate_id`, `users`.`id` from `facilitys` left join `users` on `facilitys`.`facility_user_id` = `users`.`admin_id` where `users`.`id` = " +
      inmateId +
      " limit 1",
      this.database.Facilities
    );
    facilityCharge;
    if (
      !isEmpty(facilityCharge.tablet_charge) &&
      facilityCharge.tablet_charge >= 0
    ) {
      freeTabletCharge.dataValues.value = facilityCharge.tablet_charge;
    }

    const charge = divisor * (freeTabletCharge.dataValues.value / 60);

    const userData = await this.database.Users.findOne({
      where: {
        id: inmateId,
      },
    });

    if (userData)
      await userData.update({ balance: userData.dataValues.balance - charge });

    const userinmate = await this.database.Users.findOne({
      where: {
        id: inmateId,
      },
    });

    const balanceTabletCharge = await this.database.Users.findOne({
      where: {
        id: axssConstants.balance_left,
        is_deleted: axssConstants.active,
      },
    });

    if (userinmate.dataValues.balance < balanceTabletCharge.dataValues.value) {
      const name =
        userinmate.dataValues.first_name +
        " " +
        userinmate.dataValues.last_name;

      const users = await this.database.Families.findAll({
        where: {
          inmate_id: inmate_id,
          is_deleted: 0,
          email: {
            $ne: null,
          },
        },
      });
      if (!isEmpty(users) && users.dataValues.length > 0) {
        const content = {
          title: "Recharge the account",
          body:
            "The account balance of " +
            name +
            " is very low.Only " +
            balance +
            " $ is left in the account. Please Recharge for continuing the services else services will be halted.",
        };

        users.dataValues.forEach(async (family) => {
          const receiverAddress = family.email;
          await mailService(content.title, content.body, receiverAddress);
        });
      }
    }
    return round(charge, 3);
  }

  async updateCalculatedLeftTime(
    payload,
    totalLeftTime,
    chargeStatus,
    deductCharge
  ) {
    const inmateLoggedHistoryData = await this.database.InmateLoggedHistory.findOne(
      {
        where: {
          api_token: payload["api_token"],
        },
      }
    );

    if (inmateLoggedHistoryData) {
      return await inmateLoggedHistoryData.update({
        charges: deductCharge,
      });
    }
    return false;
  }

  async createInmateReport(payload) {
    return await this.database.InmateReportHistory.create(payload);
  }

  async getUserById(id) {
    const userData = await this.database.Users.findOne({
      where: { id: id },
    });

    return userData;
  }

  async updateUser(updateObj, conditionObj) {
    const userUpdate = await this.database.Users.update(updateObj, {
      where: conditionObj,
    });
    return userUpdate;
  }

  async adminDeviceContent(payload) {
    const AdminDevice = await this.database.InmateConfigurations.findOne({
      where: { key: "device_off" },
      attributes: ["content"],
    });
    return AdminDevice;
  }

  async userInamteID(payload) {
    const userData = await this.database.Users.findOne({
      where: { id: payload.inmate_id },
    });
    return userData;
  }

  async getConfigTabletChargeData(tablet_charges, active) {
    const ConfigTabletChargeData = await this.database.InmateConfigurations.findOne(
      {
        where: {
          id: tablet_charges,
          is_deleted: active,
        },
      }
    );
    return ConfigTabletChargeData;
  }

  async getUserAnswer(user_id, question_id, answer) {
    const Userans = await this.database.UserAnswers.findOne({
      where: {
        user_id,
        question_id,
        answer,
      },
    });
    return Userans;
  }

  async delUserAns(userId, question_id) {
    const delObj = await this.database.UserAnswers.destroy({
      where: {
        user_id: userId,
        question_id: question_id,
      },
    });
    return delObj;
  }

  async delUserAllAns(userId) {
    const delObj = await this.database.UserAnswers.destroy({
      where: {
        user_id: userId,
      },
    });
    return delObj;
  }

  async createUserAns(userId, questionId, answer) {
    const createObj = await this.database.UserAnswers.create({
      user_id: userId,
      question_id: questionId,
      answer,
    });
    return createObj;
  }

  async deviceCheck(facilityId, payload) {
    const facilityDevice = await this.facilityDeviceStatus(facilityId);
    const adminDevice = await this.adminDeviceContent(payload);
    return (
      facilityDevice.dataValues.device_status &&
      adminDevice.dataValues.content == 1
    );
  }

  async getTabletCharge(facilityUserId) {
    const facilityData = await this.database.Facilities.findOne({
      where: { facility_user_id: facilityUserId },
    });
    let tabletCharge;
    let configTabletChargeData;
    if (
      !isEmpty(facilityData.tablet_charge) &&
      facilityData.tablet_charge > 0
    ) {
      tabletCharge = facilityData.tablet_charge;
    } else {
      configTabletChargeData = await this.getConfigTabletChargeData(
        axssConstants.tablet_charges,
        axssConstants.active
      );
      tabletCharge = configTabletChargeData.value;
    }
    return tabletCharge;
  }

  async deductChargeUpdateLeftTime(totalLeftTime, total, inmate_id) {
    const deductCharge = await this.calculateLoggedCharge(
      totalLeftTime,
      total,
      inmate_id
    );

    const chargeStatus = 1;
    const totalLoginTime = 0;
    await InmateService.updateCalculatedLeftTime(
      payload,
      Math.floor(totalLoginTime / 60),
      chargeStatus,
      deductCharge
    );

    return deductCharge;
  }

  async checkFlatPaid(user_id, service_id) {
    const flatQuery = await this.database.FlatRateServices.findOne({
      where: {
        user_id: user_id,
        service_id: service_id
      }
    });
    if (!flatQuery) {
      return false;
    }
    return true;
  }

  async freeMinutesRemaining(inmateId, fm) {
    try {
      let freeMinutesRemaining;
      let currentDay = moment().tz("America/New_York").format('YYYY-MM-DD');
      let currentDayStart = currentDay + ' 00:00:00.000';
      let currentDayEnd = currentDay + ' 23:59:59.000';
      let usedFreeMinutes = await this.database.sequelize.query(
        "SELECT SUM(service_history.free_minutes_used) as free_minutes_used FROM inmate_activity_history JOIN service_history ON service_history.inmate_activity_history_id = inmate_activity_history.id WHERE inmate_activity_history.inmate_id = :user_id AND inmate_activity_history.start_datetime >= CONVERT_TZ(:start_time, 'America/New_York', 'UTC') AND inmate_activity_history.start_datetime <= CONVERT_TZ(:end_time, 'America/New_York', 'UTC')",
        {
          replacements: { user_id: inmateId, start_time: currentDayStart, end_time: currentDayEnd },
          type: this.database.sequelize.QueryTypes.SELECT
        }
      );
      if (usedFreeMinutes[0].free_minutes_used == null) {
        freeMinutesRemaining = fm
      } else if (usedFreeMinutes[0].free_minutes_used != null && parseInt(usedFreeMinutes[0].free_minutes_used) >= fm) {
        freeMinutesRemaining = 0;
      } else {
        freeMinutesRemaining = fm - parseInt(usedFreeMinutes[0].free_minutes_used);
      }
      return freeMinutesRemaining;
    }
    catch (e) {
      return e;
    }
  }

  async inmateActive(userId) {
    let getRes = await this.database.sequelize.query(
      "SELECT distinct p.*, r.name as role_name, u.role_id as user_role, u.admin_id as user_admin_id, u.is_deleted as user_is_deleted FROM tbone_axxs.users as u  LEFT JOIN roles as r ON u.role_id = r.id  JOIN `role_has_permissions` as rp  ON r.id = rp.role_id JOIN permissions as p  ON p.id = rp.permission_id where u.id = :user_id LIMIT 2",
      {
        replacements: { user_id: 100 },
        type: this.database.sequelize.QueryTypes.SELECT,
      }
    );

    if (
      getRes &&
      getRes.find((element) => element.role_name === "Facility Admin") &&
      getRes.find((element) => element.name === "Tablet Launcher Setting") &&
      getRes.find((element) => element.name === "Tablet Enable Applications") &&
      getRes.find((element) => element.name === "Tablet Edit Setting")
    ) {
      let facilityData = await this.database.Facilities.findOne({
        where: { facility_user_id: userId },
      });
      if (facilityData && facilityData.is_deleted == 0) {
        return true;
      } else {
        return false;
      }
    } else if (getRes && getRes.find((element) => element.user_role === 4)) {
      let facilityData = await this.database.Facilities.findOne({
        where: { facility_user_id: getRes[0].user_admin_id },
      });
      if (facilityData) {
        if ((getRes[0].user_is_deleted === 1, facilityData.is_deleted === 1))
          return false;
        else return true;
      } else {
        return false;
      }
    } else if (
      getRes &&
      getRes[0].user_is_deleted === 0 &&
      (getRes[0].role_name === "Super Admin" ||
        (getRes.find((element) => element.name === "Tablet Launcher Setting") &&
          getRes.find(
            (element) => element.name === "Tablet Enable Applications"
          ) &&
          getRes.find((element) => element.name === "Tablet Edit Setting")))
    ) {
      return true;
    } else {
      false;
    }
  }

  async createLoginTime(data) {
    let insertLoggedHistory = await this.database.InmateLoggedHistory.create({
      api_token: data.api_token,
      device_id: data.device_id,
      inmate_id: data.inmate_id,
      start_date_time: new Date(),
    });
    return insertLoggedHistory;
  }

  async loggedInUser(userData) {
    // change JWT token
    if (userData) {
      let user = {};
      let roleInfo;
      user.id = userData.id;
      user.role_id = userData.role_id;
      switch (user.role_id) {
        case 2:
          let facilityInfo = await this.database.Facilities.findOne({
            where: { facility_user_id: user.id },
          });
          roleInfo = await this.database.Roles.findOne({
            where: { id: user.role_id },
          });
          user.detail = facilityInfo;
          user.roleDetail = roleInfo;
          break;

        case 3:
          let familyInfo = await this.database.Families.findOne({
            where: { family_user_id: user.id },
          });
          roleInfo = await this.database.Roles.findOne({
            where: { id: user.role_id },
          });
          user.detail = familyInfo;
          user.roleDetail = roleInfo;
          break;

        case 4:
          break;
        default:
          let adminInfo = await this.database.Users.findOne({
            where: { id: user.id },
          });
          roleInfo = await this.database.Roles.findOne({
            where: { id: user.role_id },
          });
          user.detail = adminInfo;
          user.roleDetail = roleInfo;
          break;
      }
      return user;
    }
    return null;
  }

  async checkLoggedTimeCurDate(inmateId) {
    let currentdate = moment().format();
    let currentTime = Date.parse(currentdate);
    let firsthalfstart = moment().format("YYYY-MM-DD") + " 00:00:00";
    let firsthalfend = moment().format("YYYY-MM-DD") + " 11:59:59";
    let starttime = Date.parse(firsthalfstart);
    let endtime = Date.parse(firsthalfend);
    let secondhalfstart = moment().format("YYYY-MM-DD") + " 12:00:00";
    let secondhalfend = moment().format("YYYY-MM-DD") + " 23:59:59";

    let totalFreeLeftTime;
    if (starttime <= currentTime && currentTime <= endtime) {

      totalFreeLeftTime = await this.database.InmateLoggedHistory.findOne({
        where: {
          inmate_id: inmate_id,
          $gt: { start_date_time: secondhalfstart },
          $lt: { start_date_time: secondhalfend },
        },
        order: [["id", "DESC"]],
        limitL: 1,

        attributes: [
          "id",
          "api_token",
          "device_id",
          "inmate_id",
          "charges",
          "start_date_time",
          "end_date_time",
          "created_at",
          "updated_at",
        ],
      });

      return totalFreeLeftTime;
    } else {
      totalFreeLeftTime = await this.database.sequelize.query(
        "SELECT `id`, `api_token`, `device_id`, `inmate_id`, `charges`, `start_date_time`, `end_date_time`, `created_at`, `updated_at` FROM `inmate_logged_history` AS `inmate_logged_history` WHERE `inmate_logged_history`.`inmate_id` = :inmate_id AND (`inmate_logged_history`.`start_date_time` <= :secondhalfend AND `inmate_logged_history`.`start_date_time` >= :secondhalfstart) ORDER BY `inmate_logged_history`.`id` DESC LIMIT 1",
        {
          replacements: {
            inmate_id: inmateId,
            secondhalfend: secondhalfend,
            secondhalfstart: secondhalfstart,
          },
        }
      );

      return totalFreeLeftTime;
    }
  }

  async checkLogs(payload) {
    const logData = await this.database.UserLogs.findOne({
      where: { user_id: payload.inmateId },
      //  attributes: ["log_file_txt"],
    });
    if (logData !== null) {
      await this.database.UserLogs.destroy({
        where: { user_id: payload.inmateId },
      });
      return true;
    } else {
      return false;
    }
  }

  async updateLogs(payload, logFileName, task) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    if (task === "up") {
      const checkLogData = await this.database.UserLogs.findOne({
        where: {
          user_id: payload.inmateId,
        },
      });

      if (checkLogData) {
        await this.database.UserLogs.update(
          {
            date: today,
            // file: logFileName,
            log_file_txt: escape(payload.logs),
          },
          {
            where: {
              id: checkLogData.id,
            },
          }
        );
        return true;
      }
    } else {
      await this.database.UserLogs.create({
        user_id: payload.inmateId,
        date: today,
        // file: logFileName,
        log_file_txt: escape(logFileName),
      });

      return true;
    }
  }

  async calculateLastlogin(timestamp) {
    let date2 = Math.floor(new Date().getTime());
    let difference = Math.abs(new Date(timestamp * 1000) - new Date(date2));
    difference = difference / 1000;

    let years = Math.floor(difference / (365 * 60 * 60 * 24));

    let months = Math.floor(
      (difference - years * 365 * 60 * 60 * 24) / (30 * 60 * 60 * 24)
    );
    let days = Math.floor(
      (difference - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24) /
      (60 * 60 * 24)
    );
    let hours = Math.floor(
      (difference -
        years * 365 * 60 * 60 * 24 -
        months * 30 * 60 * 60 * 24 -
        days * 60 * 60 * 24) /
      (60 * 60)
    );
    let minutes = Math.floor(
      (difference -
        years * 365 * 60 * 60 * 24 -
        months * 30 * 60 * 60 * 24 -
        days * 60 * 60 * 24 -
        hours * 60 * 60) /
      60
    );
    let seconds = Math.floor(
      difference -
      years * 365 * 60 * 60 * 24 -
      months * 30 * 60 * 60 * 24 -
      days * 60 * 60 * 24 -
      hours * 60 * 60 -
      minutes * 60
    );
    let last = "";

    if (years > 0) {
      last += years + " " + "years";
    }
    if (months > 0) {
      last += " " + months + " " + "months";
    }
    if (days > 0) {
      last += " " + days + " " + "days";
    }
    if (hours > 0) {
      last += " " + hours + " " + "hours";
    }
    if (minutes > 0) {
      last += " " + minutes + " " + "minutes";
    }
    if (seconds > 0) {
      last += " " + seconds + " " + "seconds";
    }
    return last + " " + "ago";
  }

  async getFacilityByAdminId(admin_id) {
    let FacilityData = await this.database.Facilities.findOne({
      where: {
        facility_user_id: admin_id
      },
    });
    return FacilityData;
  }

  async getGlobalConfigurations() {
    const GlobalConfigurations = await this.database.InmateConfigurations.findAll(
      {}
    ).map((el) => el.get({ plain: true }));
    return GlobalConfigurations;
  }

  async getResponseOfLogin(
    userData,
    device,
    payload,
    datanew,
    randomPassword,
    checkForPassword,
    request
  ) {
    /* API token update in login success case */
    let user = {
      id: userData.id,
      role_id: userData.role_id,
    };

    let inmateData = await this.getGlobalConfigurations();

    let FacilityData = await this.getFacilityByAdminId(userData.admin_id);

    let negBals = inmateData.find((el) => el.key === "negative_balance");
    let globalFreeMinutes = inmateData.find(
      (el) => el.key === axssConstants.free_minutes_key
    );
    let tab_chg_offs = inmateData.find(
      (el) => el.key === axssConstants.tablet_charge_on_off
    );

    let negBal = negBals["value"];
    let freeMin = parseInt(FacilityData.free_minutes) || parseInt(globalFreeMinutes["value"]);
    let tab_chg_off = tab_chg_offs["value"];

    let sendRes;

    if (userData) {
      let negativeBal;
      let freeMinutesleft = await this.freeMinutesRemaining(userData.id, freeMin);
      if (negBal == "0.00") {
        negativeBal = Math.abs(negBal);
      } else {
        negativeBal = -1 * Math.abs(negBal);
      }

      if (
        FacilityData["tablet_charge"] == 0 ||
        FacilityData["tablet_charges"] == 0 ||
        tab_chg_off == 0
      ) {
        var lg = 1; //can login
      } else {
        var lg = 0; //can not login
      }

      let tabletAutoLoggedTime = inmateData.find(
        (el) =>
          el.id == axssConstants.auto_logged_time &&
          el.is_deleted == axssConstants.active
      );

      let inmateLoggedRequierValue = {};
      inmateLoggedRequierValue.api_token = userData.api_token;
      inmateLoggedRequierValue.device_id = device.imei;
      inmateLoggedRequierValue.inmate_id = userData.id;

      let objInmateLogged = await this.createLoginTime(
        inmateLoggedRequierValue
      );
      let deviceValidate;

      let lowBlMsg = inmateData.find(
        (el) => el.key === axssConstants.low_balance_key
      );

      let freeMinExpMsg = inmateData.find(
        (el) => el.key === axssConstants.free_min_exp_key
      );

      let users = await this.loggedInUser(userData);

      if (userData.role_id == 4) {
        if (userData.device_id) {
          deviceValidate = await this.database.Devices.findOne({
            where: {
              imei: payload.deviceimei,
              id: userData.device_id,
            },
          });
        } else {
          deviceValidate = await this.database.Devices.findOne({
            where: {
              imei: payload.deviceimei,
              facility_id: FacilityData["id"],
            },
          });
        }

        if (deviceValidate) {
          sendRes = {
            Code: 200,
            Status: commonLang.failure,
            Data: datanew,
            Message:
              "Insufficient Balance. Friends/family can deposit money for Tablet services at InmateSales.com or 877-998-5678.",
          };
        }

        let freeTabletCharge = inmateData.find(
          (el) => el.is_deleted == 0 && el.id == axssConstants.tablet_charges
        );

        if (FacilityData["tablet_charge"]) {
          users.facility_rate = parseFloat(FacilityData["tablet_charge"]);
        } else {
          users.facility_rate = parseFloat(freeTabletCharge.value);
        }
        let negativeBalance = inmateData.find(
          (el) =>
            el.is_deleted == axssConstants.active &&
            el.id == axssConstants.negative_balance
        );

        users["Nagetive Balance"] = negativeBalance.value;
      }
      if (FacilityData["tablet_charges"] == 0 || tab_chg_off == 0) {
        var charge_on_off = 0;
      } else {
        var charge_on_off = 1;
      }

      users.auto_logged_time = tabletAutoLoggedTime.value;
      users.tablet_charge_on_off = charge_on_off;
      users.api_token = userData.api_token;
      users.NewPassword = randomPassword;
      users["DeviceImei Number"] = payload.deviceimei;
      users.token = userData.token;
      users.facility_id = device.facility_id;
      users["active_free_minutes"] = freeMinutesleft;
      users.low_balance_msg = lowBlMsg ? lowBlMsg.content : null;
      users.free_min_exp_msg = freeMinExpMsg ? freeMinExpMsg.content : null;
      users.login_time = objInmateLogged.start_date_time.getTime();

      if (payload.app_version) {
        await this.database.Devices.update(
          {
            app_version_date: payload.app_version,
          },
          {
            where: {
              imei: payload.deviceimei,
            },
          }
        );
        if (userData.last_login_history) {
          let last_login = await this.calculateLastlogin(
            userData.last_login_history
          );
          if (last_login) {
            userData.last_login_history = last_login;
          }
        }
      }
      let wlcm_message = inmateData.find(
        (el) => el.is_deleted == 0 && el.key == "welcome_msg"
      );

      let tos = inmateData.find(
        (el) => el.is_deleted == 0 && el.key == "terms_of_service"
      );

      let welcomeIsActive;
      if (wlcm_message.is_active) {
        welcomeIsActive = 1;
      } else {
        welcomeIsActive = wlcm_message.is_active;
      }
      users.welcome_message_isactive = wlcm_message ? welcomeIsActive : 0;

      if (FacilityData.welcome_msg && FacilityData.welcome_msg !== null) {
        users.welcome_message = FacilityData.welcome_msg;
      } else {
        users.welcome_message = wlcm_message ? wlcm_message.content : null;
      }

      if (FacilityData.terms_condition && FacilityData.terms_condition !== null) {
        users.terms_of_service = FacilityData.terms_condition;
      } else {
        users.terms_of_service = tos ? tos.content : null;
      }

      await this.database.Users.update(
        {
          last_login_history: Math.ceil(new Date().getTime() / 1000),
        },
        {
          where: {
            id: userData.id,
          },
        }
      );
      const dataNew = { ...userData.dataValues, ...users };

      sendRes = {
        Code: 200,
        Status: commonLang.success,
        Data: dataNew,
        Message: inmateLang.inmate_logged_success,
      };

      return sendRes;
    } else {
      sendRes = {
        Code: 200,
        Status: commonLang.failure,
        Data: datanew,
        Message: inmateLang.inmate_not_found,
      };
      return sendRes;
    }
    return true;
  }

  async saveToken(token) {
    const saveToken = await this.database.sequelize.query(
      "INSERT INTO `user_token` (`id`,`token`) VALUES (DEFAULT,:token);",
      {
        replacements: { token: token },
      }
    );
    return saveToken;
  }

  async updateToken(token, updateVal) {
    let updateTokenVal = await this.database.UserTokens.update(
      {
        token: updateVal,
      },
      {
        where: {
          token,
        },
      }
    );
    return updateTokenVal;
  }

  async getFreeMinutes(inmateId) {
    const FreeMinutes = await this.database.FreeMinutes.findOne({
      where: {
        inmate_id: inmateId,
      },
    });
    return FreeMinutes;
  }

  async getFacilityTableChargeByInmateID(inmateId) {
    let getTableCharge = await this.database.sequelize.query(
      "SELECT `facilitys`.`id`, `facilitys`.`tablet_charge` AS `tablet_charge`, `facilitys`.`tablet_charges` AS `tablet_charges`, `user`.`id` AS `user.id`, `user`.`inmate_id` AS `user.id` FROM `facilitys` AS `facilitys` INNER JOIN `users` AS `user` ON `facilitys`.`facility_user_id` = `user`.`admin_id` Where `user`.`id` = :inmateId LIMIT 1",
      {
        replacements: { inmateId },
        type: this.database.sequelize.QueryTypes.SELECT,
      }
    );
    return getTableCharge;
  }

  async updateBalance(inmateId, balance) {
    let updateVal = await this.database.Users.update(
      {
        balance: this.database.sequelize.literal("balance - " + balance),
      },
      {
        where: {
          id: inmateId,
        },
      }
    );
    return updateVal;
  }

  async updateBalanceToZero(inmateId) {
    let updateVal = await this.database.Users.update(
      {
        balance: 0,
      },
      {
        where: {
          id: inmateId,
        },
      }
    );
    return updateVal;
  }

  async sendFamilyEmail(name, inmate_id, balance) {
    let users = await this.database.Families.findOne({
      where: {
        email: {
          $ne: "",
        },
        is_deleted: 0,
      },
    });

    if (users.length > 0) {
      let content = {
        title: "Recharge the account",
        body:
          "The account balance of " +
          name +
          " is very low.Only " +
          balance +
          " $ is left in the account. Please Recharge for continuing the services else services will be halted.",
      };
      users.dataValues.forEach(async (family) => {
        // Send Mail to family->email
        const receiverAddress = family.email;
        await mailService(title, body, receiverAddress);
      });
      return true;
    }
    return true;
  }

  async calculateLoggedCharge(divisor, tabletCharge, inmateId) {
    let freeTabletCharge = await this.database.InmateConfigurations.findOne({
      where: {
        id: axssConstants.tablet_charges,
        is_deleted: axssConstants.active,
      },
    });
    let freeTabletChargeOnOff = await this.database.InmateConfigurations.findOne(
      {
        where: {
          key: axssConstants.tablet_charge_on_off,
        },
      }
    );

    let facility_charge = await this.getFacilityTableChargeByInmateID(inmateId);
    let freeTabletChargeNew = { ...freeTabletCharge.dataValues };
    if (
      facility_charge[0].tablet_charge &&
      facility_charge[0].tablet_charge >= 0
    ) {
      freeTabletChargeNew.value = facility_charge[0].tablet_charge;
    }
    if (
      facility_charge[0].tablet_charges == 0 ||
      freeTabletChargeOnOff.content == 0
    ) {
      freeTabletChargeNew.value = 0;
    }
    let charge = divisor * (freeTabletChargeNew.value / 60);
    charge = charge.toFixed(3);
    await this.updateBalance(inmateId, charge);
    let userinmate = await this.database.Users.findOne({
      where: {
        id: inmateId,
      },
    });
    let balanceTabletCharge = await this.database.InmateConfigurations.findOne({
      where: {
        id: axssConstants.balance_left,
        is_deleted: axssConstants.active,
      },
    });
    let name;
    if (userinmate.balance < balanceTabletCharge.value) {
      name = userinmate.first_name + " " + userinmate.last_name;
      this.sendFamilyEmail(name, inmateId, userinmate.balance);
    }

    return charge;
  }

  async updateCalculatedLeftTimeLoggedHistory(
    payload,
    totalLefTime,
    chargeStatus,
    deductCharge
  ) {
    let updateLoggedHis = await this.database.InmateLoggedHistory.update(
      {
        charges: deductCharge,
      },
      {
        where: {
          api_token: payload.api_token,
        },
      }
    );
    return updateLoggedHis;
  }

  async updateCalculatedLeftTimeFreeMin(payload, totalLefTime) {
    let updateFreeMin = await this.database.FreeMinutes.update(
      {
        left_minutes: totalLefTime,
      },
      {
        where: {
          inmate_id: payload.inmate_id,
        },
      }
    );
    return updateFreeMin;
  }
  async getResponseOfStaffLogin(userData, device) {
    let inmateLoggedRequierValue = {};
    inmateLoggedRequierValue.api_token = userData.api_token;
    inmateLoggedRequierValue.device_id = device.imei;
    inmateLoggedRequierValue.inmate_id = userData.id;
    let userDataNew = { ...userData.dataValues };
    let wlcm_message = await this.database.InmateConfigurations.findOne({
      where: {
        is_deleted: "0",
        key: "welcome_msg",
      },
    });
    let tabletAutoLoggedTime = await this.database.InmateConfigurations.findOne(
      {
        where: {
          id: axssConstants.auto_logged_time,
          is_deleted: axssConstants.active,
        },
      }
    );

    let tos = await this.database.InmateConfigurations.findOne({
      where: {
        is_deleted: "0",
        key: "terms_of_service",
      },
    });
    let welcomeIsActive;
    if (wlcm_message.is_active) {
      welcomeIsActive = 1;
    } else {
      welcomeIsActive = wlcm_message.is_active;
    }
    userDataNew.token = userData.api_token;
    userDataNew.welcome_message_isactive = wlcm_message ? welcomeIsActive : 0;
    userDataNew.auto_logged_time = tabletAutoLoggedTime.value;

    let facility = await this.database.Facilities.findOne({
      where: {
        facility_user_id: userData.admin_id,
      },
    });
    if (facility.welcome_msg && facility.welcome_msg !== null) {
      userDataNew.welcome_message = facility.welcome_msg;
    } else {
      userDataNew.welcome_message = wlcm_message ? wlcm_message.content : null;
    }

    if (facility.terms_condition && facility.terms_condition) {
      userDataNew.terms_of_service = facility.terms_condition;
    } else {
      userDataNew.terms_of_service = tos ? tos.content : null;
    }
    userDataNew.facility_id = device.facility_id;
    let last_login = await this.calculateLastlogin(userData.last_login_history);
    if (last_login) {
      userDataNew.last_login_history = last_login;
    }
    let objInmateLogged = await this.createLoginTime(inmateLoggedRequierValue);
    userDataNew.login_time = objInmateLogged.start_date_time.getTime();

    await this.updatechecklogin(userDataNew.id);
    let sendResponse = {
      Code: 200,
      Status: commonLang.success,
      Data: userDataNew,
      Message: inmateLang.inmate_logged_success,
    };
    return sendResponse;
  }

  async updatechecklogin(inmateId) {
    await this.database.Users.update(
      {
        last_login_history: Math.ceil(new Date().getTime() / 1000),
      },
      {
        where: {
          id: inmateId,
        },
      }
    );
  }
}

module.exports = new InmateService();
