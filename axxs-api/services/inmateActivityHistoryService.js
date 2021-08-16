const { axss: axssConstants } = require("../constants/");
const mailService = require("./mailService");
const bcrypt = require("bcrypt-nodejs");

class InmateActivityHistoryService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getInmateActivityHistory(inmate_activity_history_id) {
    const inmateActivityHistoryData = await this.database.InmateActivityHistory.findOne(
      {
        where: { id: inmate_activity_history_id }
      }
    );

    return inmateActivityHistoryData;
  }

  async getInmateActivityHistoryNew(inmateId) {
    let alltypeService = await this.database.sequelize.query(
      "SELECT inmate_activity_history.id, inmate_activity_history.start_datetime, inmate_activity_history.end_datetime, service_history.charges, services.name FROM inmate_activity_history LEFT JOIN services ON services.id = inmate_activity_history.service_id INNER JOIN service_history ON service_history.inmate_activity_history_id = inmate_activity_history.id WHERE inmate_activity_history.inmate_id = :inmateId ORDER BY inmate_activity_history.start_datetime DESC;",
      {
        replacements: { inmateId },
        type: this.database.sequelize.QueryTypes.SELECT
      }
    );

    return alltypeService;
  }

  async getFacilityServiceChargeData(payload) {
    const facilityServiceChargeData = await this.database.ServiceChargeByFacilities.findOne(
      {
        where: {
          facility_id: payload.facility_id,
          service_id: payload.service_id
        }
      }
    );

    return facilityServiceChargeData;
  }

  async getServiceData(payload) {
    const serviceData = await this.database.Services.findOne({
      where: {
        id: payload.service_id
      }
    });
    return serviceData;
  }

  async getFlatRateServiceData(serviceId, payload) {
    const flatRateServiceData = await this.database.FlatRateServices.findOne({
      where: {
        service_id: serviceId,
        user_id: payload.inmate_id
      }
    });

    return flatRateServiceData;
  }

  async createFlatRateServiceData(data) {
    const flatRateServiceData = await this.database.FlatRateServices.create(
      data
    );

    return flatRateServiceData;
  }

  async createEstimateServiceUse(data, s_time, e_time) {
    let estimateServiceUseDataSubmitted = null;
    const estimateServiceUseData = await this.database.EstimateServiceUse.findOne(
      {
        where: {
          date_time: {
            $between: [new Date(s_time), new Date(e_time)]
          },
          inmate_id: data.inmate_id,
          facility_id: data.facility_id,
          service_id: data.service_id,
          date: data.date
        }
      }
    );
    if (estimateServiceUseData == null) {
      estimateServiceUseDataSubmitted = await this.database.EstimateServiceUse.create(
        data
      );
    }
    return estimateServiceUseDataSubmitted;
  }

  async decreaseUserBalance(inmateId, balance) {
    const userData = await this.database.Users.findOne({
      where: {
        id: inmateId
      }
    });

    if (userData) {
      await userData.update({ balance: userData.dataValues.balance - balance });
    }
  }

  async getServiceHistoryData(filters) {
    const serviceHistoryData = await this.database.ServiceHistory.findOne({
      where: filters
    });
    return serviceHistoryData;
  }

  async updateServiceHistoryData(serviceHistoryData) {
    if (serviceHistoryData) {
      const { id, ...updateData } = serviceHistoryData;

      let updateStatus = await this.database.ServiceHistory.update(updateData, {
        where: {
          id: serviceHistoryData.id
        }
      });
      return updateStatus;
    }
    return false;
  }

  async getUserBalanceData(inmateId) {
    const userBalanceData = await this.database.Users.findOne({
      where: {
        id: inmateId
      }
    });
    return userBalanceData;
  }

  async createInmateActivityHistoryData(data) {
    const inmateActivityHistoryData = await this.database.InmateActivityHistory.create(data);
    return inmateActivityHistoryData;
  }

  async getUserData(inmateId) {
    const userData = await this.database.Users.findOne({
      where: {
        id: inmateId
      }
    });
    return userData;
  }

  async createServiceHistoryData(data) {
    const serviceHistoryData = await this.database.ServiceHistory.create(data);
    return serviceHistoryData;
  }

  async sendEmailToFacilityAdmin(payload) {
    const randomPassword = [...Array(10)]
      .map(i => (~~(Math.random() * 36)).toString(36))
      .join("");

    const emailInfo = (
      await this.database.sequelize.query(
        "select `facilitys`.`email`, `facilitys`.`twilio_number`, `users`.`first_name` as `inmate_name`, `users`.`username` as `username`, `users`.`inmate_id` as `inmate_id`, `users`.`id` from `facilitys` left join `users` on `facilitys`.`facility_user_id` = `users`.`admin_id` where `users`.`id` = " +
        payload.inmate_id +
        " limit 1",
        this.database.Facilities
      )
    )[0][0];

    const title = "Password has been reset for username:" + emailInfo.username;
    const body =
      "User password has been reset for clicking on an unauthorized  link, users new password is:- ";
    const emailPayload = {
      recipient: {
        email: emailInfo.email,
        sender: "shibyanu@chetu.com"
      },
      subject: title,
      body: body + " " + randomPassword
    };
    await mailService(
      emailPayload.subject,
      emailPayload.body,
      emailPayload.recipient
    );

    const userData = await this.database.Users.findOne({
      where: {
        id: payload.inmate_id
      }
    });

    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(randomPassword, salt);

    userData.dataValues.password = hash;

    return await userData.save();
  }

  async updateInmateActivityHistoryData(
    inmateActivityHistoryId,
    currTimeStamp,
    startTimeStamp
  ) {
    const inmateActivityHistoryData = await this.database.InmateActivityHistory.findOne(
      {
        where: {
          id: inmateActivityHistoryId
        }
      }
    );

    if (inmateActivityHistoryData) {
      await inmateActivityHistoryData.update({
        end_time: currTimeStamp,
        start_time: startTimeStamp
      });
    }
  }

  async sumTotalExtraAmt(
    startTimeStamp,
    historyUpdatedAt,
    inmateId,
    serviceId
  ) {
    const inmateActivityHistoryData = await this.database.InmateChargesHistory.findOne(
      {
        where: {
          created_at: {
            $between: [startTimeStamp, historyUpdatedAt]
          },
          inmate_id: inmateId,
          service_id: serviceId
        },
        attributes: [
          [
            this.database.sequelize.fn(
              "sum",
              this.database.sequelize.col("transaction")
            ),
            "total"
          ]
        ]
      }
    );
    return inmateActivityHistoryData.dataValues.total;
  }

  async enterService(userData, serviceData, currDateTimeStamp) {
    let t = await this.database.sequelize.transaction();
    try {
      const inmateActivityHistory = await this.database.InmateActivityHistory.create({
        inmate_id: userData.id,
        service_id: serviceData.id,
        inmate_logged_history_id: 0,
        exit_reason: null,
        start_datetime: currDateTimeStamp,
        end_datetime: null
      }, { transaction: t });

      let serviceHistory;
      let freeMinuteBalance = userData.active_free_minutes;
      if (serviceData.type == 1) {
        if (userData.active_free_minutes > 0) {
          serviceHistory = await this.database.ServiceHistory.create({
            inmate_activity_history_id: inmateActivityHistory.id,
            inmate_id: userData.id,
            service_id: serviceData.id,
            transaction_id: null,
            type: serviceData.type,
            duration: 60,
            rate: serviceData.charge,
            charges: 0,
            free_minutes_used: 1
          }, { transaction: t });
          freeMinuteBalance = userData.active_free_minutes - 1;
        } else {
          serviceHistory = await this.database.ServiceHistory.create({
            inmate_activity_history_id: inmateActivityHistory.id,
            inmate_id: userData.id,
            service_id: serviceData.id,
            transaction_id: null,
            type: serviceData.type,
            duration: 60,
            rate: serviceData.charge,
            charges: serviceData.charge,
            free_minutes_used: 0
          }, { transaction: t });
        }
      } else {
        serviceHistory = await this.database.ServiceHistory.create({
          inmate_activity_history_id: inmateActivityHistory.id,
          inmate_id: userData.id,
          service_id: serviceData.id,
          transaction_id: null,
          type: serviceData.type,
          duration: 60,
          rate: serviceData.charge,
          charges: serviceData.charge,
          free_minutes_used: 0
        }, { transaction: t });
      }


      let chargeAmount = 0;
      let flatRateServiceData;
      if (serviceData.flat_rate == 1 && !serviceData.flatRatePaid) {
        flatRateServiceData = await this.database.FlatRateServices.create({
          user_id: userData.id,
          service_id: serviceData.id,
          flate_rate: parseFloat(serviceData.flat_rate_charge)
        }, { transaction: t });
        chargeAmount = parseFloat(serviceData.flat_rate_charge);
      };

      if (serviceData.type == 1 && userData.active_free_minutes == 0) {
        chargeAmount = chargeAmount + serviceData.charge;
      }

      if (serviceData.type == 2) {
        chargeAmount = chargeAmount + serviceData.charge;
      }

      if (chargeAmount > userData.balance) {
        throw Error('Trying to charge more than the users balance');
      }
      let updateUser;
      let newBalance = userData.balance - chargeAmount
      newBalance = parseFloat(newBalance.toFixed(2));
      if (chargeAmount > 0) {
        updateUser = await this.database.Users.update({
          balance: newBalance
        }, {
          where: {
            id: userData.id
          }
        }, { transaction: t });
      }

      t.commit();
      return ({
        "Code": 200,
        "Message": "Success",
        "Status": "User activity created successfully",
        "Data": {
          "inmate_activity_history_id": inmateActivityHistory.id,
          "service_history_id": serviceHistory.id,
          "available_balance": newBalance,
          "active_free_minutes": freeMinuteBalance,
          "type": serviceData.type
        }
      });
    } catch (err) {
      t.rollback();
    }
  };
  async spendMinute(userData, serviceHistoryData) {
    let t = await this.database.sequelize.transaction();
    try {
      let serviceHistory;
      if (serviceHistoryData.type == 0) {
        serviceHistory = await this.database.ServiceHistory.update({
          duration: parseInt(serviceHistoryData.duration + 60)
        }, {
          where: {
            id: serviceHistoryData.id
          }
        }, { transaction: t });
      }
      let freeMinuteBalance = userData.active_free_minutes;
      if (serviceHistoryData.type == 1 && userData.active_free_minutes > 0) {
        serviceHistory = await this.database.ServiceHistory.update({
          duration: parseInt(serviceHistoryData.duration + 60),
          free_minutes_used: parseInt(serviceHistoryData.free_minutes_used + 1)
        }, {
          where: {
            id: serviceHistoryData.id
          }
        }, { transaction: t });
        freeMinuteBalance = userData.active_free_minutes - 1;
      }

      let chargeAmount = 0;

      if (serviceHistoryData.type == 1 && userData.active_free_minutes == 0) {
        chargeAmount = chargeAmount + serviceHistoryData.rate;
      }

      if (serviceHistoryData.type == 2) {
        chargeAmount = chargeAmount + serviceHistoryData.rate;
      }

      if (chargeAmount > userData.balance) {
        throw Error('Trying to charge more than the users balance');
      }
      let updateUser;
      let newBalance = userData.balance - chargeAmount
      newBalance = parseFloat(newBalance.toFixed(2));
      let newCharge = parseFloat(serviceHistoryData.charges) + parseFloat(serviceHistoryData.rate);
      newCharge = parseFloat(newCharge.toFixed(2));
      if (chargeAmount > 0) {
        serviceHistory = await this.database.ServiceHistory.update({
          duration: parseInt(serviceHistoryData.duration + 60),
          charges: newCharge
        }, {
          where: {
            id: serviceHistoryData.id
          }
        }, { transaction: t });
        updateUser = await this.database.Users.update({
          balance: newBalance
        }, {
          where: {
            id: userData.id
          }
        }, { transaction: t });
      }

      t.commit();

      return ({
        "Code": 200,
        "Message": "Success",
        "Status": "User minute created successfully",
        "Data": {
          "service_history_id": serviceHistory.id,
          "available_balance": newBalance,
          "active_free_minutes": freeMinuteBalance,
          "type": serviceHistoryData.type
        }
      });
    } catch (err) {
      t.rollback();
    }
  };
  async endService(payload, currDateTimeStamp, serviceHistoryData) {
    let t = await this.database.sequelize.transaction();
    try {
      const serviceHistory = await this.database.ServiceHistory.update({
        duration: parseInt(payload.time_of_usage)
      }, {
        where: {
          id: serviceHistoryData.id
        }
      }, { transaction: t });

      const inmateActivityHistory = await this.database.InmateActivityHistory.update({
        end_datetime: currDateTimeStamp,
        exit_reason: payload.exit_reason
      }, {
        where: {
          id: payload.inmate_activity_history_id
        }
      }, { transaction: t });

      t.commit();

      return ({
        "Code": 200,
        "Message": "Success",
        "Status": "Service ended"
      });
    } catch (err) {
      t.rollback();
    }
  };
}

module.exports = new InmateActivityHistoryService();
