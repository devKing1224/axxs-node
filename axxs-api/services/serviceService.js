const { axss: axssConstants } = require("../constants/");
class ServiceService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getAllServiceBooksData() {
    const allServiceBooksData = await this.database.ServiceBooks.findAll({
      where: { is_deleted: axssConstants.active }
    });

    return allServiceBooksData;
  }

  async getInmateService(query) {
    const InmateServiceData = await this.database.Services.findOne({
      where: { inmate_id: query.inmate_id }
    });

    return InmateServiceData;
  }

  async getInmateServiceInfo(inmateId, roleId) {
    if (roleId == 8) {
      let InmateServiceInfo = await this.database.sequelize.query(
        "select DISTINCT services.*, service_category.name as Service_category_name from services left join default_service_permissions on default_service_permissions.service_id = services.id left join service_category on service_category.id = services.service_category_id where default_service_permissions.facility_id = :inmateId and services.is_deleted = :is_deleted order by service_category_id asc",
        {
          replacements: { is_deleted: 0, inmateId },
          type: this.database.sequelize.QueryTypes.SELECT
        }
      );
      return InmateServiceInfo;
    }
    let InmateServiceInfo = await this.database.sequelize.query(
      "select DISTINCT services.*, service_category.name as Service_category_name from services left join service_permissions on service_permissions.service_id = services.id left join service_category on service_category.id = services.service_category_id where service_permissions.inmate_id = :inmateId or service_permissions.inmate_id = 0 and services.is_deleted = :is_deleted order by service_category_id asc",
      {
        replacements: { is_deleted: 0, inmateId },
        type: this.database.sequelize.QueryTypes.SELECT
      }
    );
    return InmateServiceInfo;
  }
  async getserviceall(inmateId, inmateServiceInfo, roleId) {
    let serviceall;
    if (roleId == 8) {
      serviceall = await this.database.sequelize.query(
        "select DISTINCT id, 0 as service_category_id, 1 as user_id, name, Null as base_url, icon_url as logo_url, 0 as type, 0 as charge, sequence, is_deleted, created_at, updated_at, name as Service_category_name from service_category where exists (select * from services where service_category.id = services.service_category_id and exists (select * from default_service_permissions where services.id = default_service_permissions.service_id and facility_id = :inmateId) and is_deleted = :is_deleted) and is_deleted = :is_deleted order by sequence asc",
        {
          replacements: { is_deleted: 0, inmateId },
          type: this.database.sequelize.QueryTypes.SELECT
        }
      );
    } else {
      serviceall = await this.database.sequelize.query(
        "select DISTINCT id, 0 as service_category_id, 1 as user_id, name, Null as base_url, icon_url as logo_url, 0 as type, 0 as charge, sequence, is_deleted, created_at, updated_at, name as Service_category_name from service_category where exists (select * from services where service_category.id = services.service_category_id and exists (select * from service_permissions where services.id = service_permissions.service_id and inmate_id = :inmateId) and is_deleted = :is_deleted) and is_deleted = :is_deleted order by sequence asc",
        {
          replacements: { is_deleted: 0, inmateId },
          type: this.database.sequelize.QueryTypes.SELECT
        }
      );
    }

    serviceall = serviceall.reduce((unique, o) => {
      if (!unique.some(obj => obj.id === o.id)) {
        unique.push(o);
      }
      return unique;
    }, []);

    let ids = [];
    ids = serviceall.map(value => value.id);

    // const filter_data = { id: ids };
    let subcats;
    if (roleId == 8) {
      subcats = await this.database.sequelize.query(
        "select DISTINCT services.* from services left join default_service_permissions on default_service_permissions.service_id = services.id where default_service_permissions.facility_id = :inmateId  and services.is_deleted = :is_deleted order by service_category_id asc",
        {
          replacements: { is_deleted: 0, inmateId },
          type: this.database.sequelize.QueryTypes.SELECT
        }
      );
    } else {
      subcats = await this.database.sequelize.query(
        "select services.* from services left join service_permissions on service_permissions.service_id = services.id where service_permissions.inmate_id = :inmateId  and services.is_deleted = :is_deleted order by service_category_id asc",
        {
          replacements: { is_deleted: 0, inmateId },
          type: this.database.sequelize.QueryTypes.SELECT
        }
      );
    }

    subcats = subcats.map(item => {
      item.keyboardEnabled === 1 ? item.keyboardEnabled = true : item.keyboardEnabled = false;
      return item;
    });

    const subCatsData = subcats.filter(function(array_el) {
      return (
        serviceall.filter(function(anotherOne_el) {
          return anotherOne_el.service_category_id == array_el.id;
        }).length == 0
      );
    });

    let flateServiceInfo = await this.database.FlatRateServices.findAll({
      where: {
        // service_id: subcategory.id,
        user_id: inmateId
      },
      attributes: ["id", "user_id", "service_id", "flate_rate"]
    }).map(el => el.get({ plain: true }));
    let facilityId = await this.getFacilityID(inmateId);

    let getCustomserviceDetails = await this.database.ServiceChargeByFacilities.findAll(
      {
        where: {
          facility_id: facilityId
          // service_id: element.id
        },
        attributes: ["id", "service_id", "type", "service_msg", "facility_id"]
      }
    ).map(el => el.get({ plain: true }));

    let serviceallWithFlat = [];
    for (const element of serviceall) {
      let subcategoryArray = [];

      for (const elements of subCatsData) {
        let subcategory = elements;
        if (element.id == elements.service_category_id) {
          if (subcategory.type == 2) {
            if (flateServiceInfo) {
              for (var i = 0; i < flateServiceInfo.length; ++i) {
                var flat_checks = flateServiceInfo[i];

                if (flat_checks.service_id == subcategory.id) {
                  // hasMatch = true;
                  subcategory.flat_charged = 1;
                  break;
                }
              }
            }
          }
          if (getCustomserviceDetails) {
            for (var i = 0; i < getCustomserviceDetails.length; ++i) {
              var service_checks = getCustomserviceDetails[i];
              if (service_checks.id == subcategory.id) {
                // hasMatch = true;
                subcategory.msg = service_checks.service_msg;
                break;
              }
            }
          }
          subcategoryArray.push(subcategory);
        }
        element.subcategory = subcategoryArray;
      }
      serviceallWithFlat.push(element);
    }

    let allCategory = {};
    allCategory.Category = serviceallWithFlat;
    // let newCat = [];
    const filterServiceInfo = inmateServiceInfo.filter(
      element => element.Service_category_name === null
    );

    for (const element of filterServiceInfo) {
      element.flat_charged = 0;
      if (element.type == 2) {
        let flateServiceInfo = await this.database.FlatRateServices.findOne({
          where: {
            service_id: element.id,
            user_id: inmateId
          }
        });
        if (flateServiceInfo) {
          element.flat_charged = 1;
        }
      }
      allCategory.Category.push(element);
    }

    return allCategory;
  }

  async getAllService(inmateId) {
    // raw query Sequelize
    const GetAllService = await this.database.sequelize.query(
      "select id, 0 as service_category_id, 1 as user_id, name, Null as base_url, icon_url as logo_url, 0 as type, 0 as charge, is_deleted, created_at, updated_at, name as Service_category_name from service_category where exists (select * from services where service_category.id = services.service_category_id and exists (select * from service_permissions where services.id = service_permissions.service_id and inmate_id = :inmate_id) and is_deleted = :is_deleted) and is_deleted = :is_deleted order by sequence asc",
      {
        replacements: { inmate_id: inmateId, is_deleted: 0 },
        type: this.database.sequelize.QueryTypes.SELECT
      }
    );
    return GetAllService;
  }

  async isServiceblock(inmateId) {
    // raw query Sequelize
    const bsDetails = await this.database.BlockServices.findOne({
      where: { inmate_id: inmateId }
    });
    if (bsDetails) {
      let curDate = new Date().toISOString().split("T")[0];
      if (
        curDate == bsDetails.start_date ||
        curDate == bsDetails.end_date ||
        (curDate > bsDetails.start_date && curDate < bsDetails.end_date)
      ) {
        return true;
      }
      return false;
    }
    return false;
  }

  async flatRateServices(inmateId, serviceId) {
    const FlatRateChk = await this.database.FlatRateServices.findOne({
      where: { user_id: inmateId, service_id: serviceId }
    });
    return FlatRateChk;
  }

  async getAllCategory(inmateServiceInfo, inamteId) {
    let serviceall = await this.getAllService(inamteId);
    let serviceallWithFlat = [];

    for (const services of serviceall) {
      for (let i = 0; i < services.subcategory; i++) {
        services.subcategory[i].flat_charged = 0;
        if (services.subcategory[i].type === 2) {
          const flateServiceInfo = await ServiceService.flatRateServices(
            inamteId,
            services.subcategory.id
          );
          if (flateServiceInfo) {
            services.subcategory[i].flat_charged = 1;
          }
        }
      }
      serviceallWithFlat.push(services);
    }
    let allCategory = {};
    allCategory.Category = serviceallWithFlat;
    inmateServiceInfo.forEach(async val => {
      val.flat_charged = 0;
      if (val.Service_category_name == null) {
        if (val.type == 2) {
          const flateServiceInfo = await this.flatRateServices(
            inamteId,
            val.id
          );
          if (flateServiceInfo) {
            val.flat_charged = 1;
          }
        }
        allCategory.Category = val;
      }
    });

    //checking if user services are blocked
    const checkBlockservice = await this.isServiceblock(inamteId);
    allCategory.block_service = {};
    if (checkBlockservice) {
      allCategory.block_service.is_block = true;
    } else {
      allCategory.block_service.is_block = false;
    }
    allCategory.block_service.msg =
      "All Services are blocked Please contact administrator";
    return allCategory;
  }

  async getFacilityID(inmateId) {
    this.database.Facilities.belongsTo(this.database.Users, {
      foreignKey: "facility_user_id",
      targetKey: "admin_id"
    });

    const Facilitiy = await this.database.Facilities.findOne({
      attributes: ["id"],
      include: {
        model: this.database.Users,
        attributes: [],
        where: {
          id: inmateId
        }
      }
    });
    if (Facilitiy) {
      return Facilitiy.id;
    }
    return 0;
  }

  async getUserData(userId) {
    const userData = await this.database.Users.findOne({
      where: { id: userId }
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
        "location"
      ],
      where: { id: userId }
    });

    return userData;
  }

  async getFacilityUserId(admin_id) {
    const facilityUserId = await this.database.Facilities.findOne({
      where: { facility_user_id: admin_id }
    });
    return facilityUserId;
  }
}

module.exports = new ServiceService();
