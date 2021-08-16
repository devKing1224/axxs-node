const {expect,assert} = require("chai");
const AuthenticationService = require("../axxs-api/services/authenticationService");
const fakedatabase = require("./fakedatabase");
const fakelogger = require("./fakelogger");
const bcrypt = require("bcrypt-nodejs");
const JWT = require("jsonwebtoken");

describe("Authentication Service", ()=>{
    describe('init',()=>{
        it('inits',()=>{
            const props = {database: fakedatabase, logger: fakelogger};
            AuthenticationService.init(props);
            expect(AuthenticationService.database).to.equal(fakedatabase);
            expect(AuthenticationService.logger).to.equal(fakelogger);
        });
    });
    describe('comparePassword', ()=>{
        let hashedPass = bcrypt.hashSync("foo");
        let payload = {password:"foo"};
        let checkForPassword = {dataValues: {password: hashedPass}};
        it('returns true when passwords match and current is null', ()=>{
            let foo = AuthenticationService.comparePassword(payload, checkForPassword);

            expect(foo).to.be.true;
        });
        it('returns false when there is a mismatch',()=>{
            payload = {password:"foo"};
            let hashedPass1 = bcrypt.hashSync("bar");
            checkForPassword.dataValues.password = hashedPass1;

            let foo = AuthenticationService.comparePassword(payload, checkForPassword);

            expect(foo).to.be.false;
        });
        it('returns false when there is a mismatch in current password',()=>{
            payload = {password:"baz"};
            let hashedPass1 = bcrypt.hashSync("bar");
            let hashedPass2 = bcrypt.hashSync("foo");
            checkForPassword.dataValues.password = hashedPass1;
            let currentPassword = {dataValues:{password:hashedPass2}};

            let foo = AuthenticationService.comparePassword(payload, checkForPassword, currentPassword);

            expect(foo).to.be.false;
        });
        it('returns true when there is a mismatch in payload password but matches current',()=>{
            payload = {password:"baz"};
            let hashedPass1 = bcrypt.hashSync("bar");
            let hashedPass2 = bcrypt.hashSync("baz");
            checkForPassword.dataValues.password = hashedPass1;
            let currentPassword = {dataValues:{password:hashedPass2}};

            let foo = AuthenticationService.comparePassword(payload, checkForPassword, currentPassword);

            expect(foo).to.be.true;
        })
    });
    describe('userIsBlocked',()=>{
        it('returns true when status is 1',()=>{
            let userData = {dataValues:{status:1}};
            let isBlocked = AuthenticationService.userIsBlocked(userData);
            expect(isBlocked).to.be.true;
        });
        it('returns false when status is not 1',()=>{
            let userData = {dataValues:{status:4}};
            let isBlocked = AuthenticationService.userIsBlocked(userData);
            expect(isBlocked).to.be.false;
        });
    });
    describe('checkPasswordWithFacilityUserId',  ()=>{
        it('will get user data by role when user data is null',async ()=>{
            AuthenticationService.inmateService = {
                getFacilityUserData: () => {
                    return null
                },
                getFacilityUserDataByRole : ()=>{
                    return {result:"getFacilityUserDataByRole"}
                }
            };
            let result = await AuthenticationService.checkPasswordWithFacilityUserId({},123);

            expect(result.result).to.equal('getFacilityUserDataByRole')
        });
        it('will get user data when user data is returned', async () => {
            AuthenticationService.inmateService = {
                getFacilityUserData: () => {
                    return {result:"userData"}
                },
                getFacilityUserDataByRole: () => {
                    return {result: "getFacilityUserDataByRole"}
                }
            };
            let result = await AuthenticationService.checkPasswordWithFacilityUserId({}, 123);

            expect(result.result).to.equal('userData')
        })
    });
    describe('signToken',()=>{
        it('will sign a token with JWT',()=>{
            let userData = {dataValues:{id:1,admin_id:2}};
            let signedToken = AuthenticationService.signToken(userData, "secret");
            let decoded = JWT.decode(signedToken);

            expect(decoded.id).to.equal(1);
            expect(decoded.admin_id).to.equal(2);
        })
    });
    describe('signImmortalToken',()=>{
       it('will generate an immortal token',()=>{
           let signedToken = AuthenticationService.signImmortalToken("secret");
           let decoded = JWT.decode(signedToken);
           assert.isNumber(decoded.iat);
       })
    });
});
