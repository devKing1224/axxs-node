
const InmateService = require('../services/inmateService')
const bcrypt = require("bcrypt-nodejs");
const JWT = require("jsonwebtoken");
class AuthenticationService {
    init(props) {
        if (!this.database) {
            this.database = props.database;
            this.logger = props.logger || null;
        }
        this.inmateService = InmateService;
        this.inmateService.init(props);
    }
    comparePassword(payload, checkForPassword, currentPassword = null) {
        let compareWithCheck = bcrypt.compareSync(
            payload.password,
            checkForPassword.dataValues.password.replace(
                /^\$2y(.+)$/i,
                "$2a$1"
            )
        );
        let compareWithCurrent = false;
        if(currentPassword!==null){
            compareWithCurrent = bcrypt.compareSync(
                payload.password,
                currentPassword.dataValues.password
            )
        }

        return compareWithCheck || compareWithCurrent;
    }

    userIsBlocked(userData) {
        return userData.dataValues["status"] === 1 ?  true : false;
    }

    async checkPasswordWithFacilityUserId(payload, facility_user_id){
        let checkForPassword = await this.inmateService.getFacilityUserData(
            payload,
            facility_user_id
        );

        if (checkForPassword === null) {
            checkForPassword = await this.inmateService.getFacilityUserDataByRole(
                payload,
                2
            );
        }
        return checkForPassword;
    }
    signToken(userData, secret) {
        return JWT.sign(
            {
                ...{
                    id: userData.dataValues.id,
                    admin_id: userData.dataValues.admin_id
                }
            },
            secret
        );
    }
    signImmortalToken(secret){
        return JWT.sign({},secret)
    }
}

module.exports = new AuthenticationService();



