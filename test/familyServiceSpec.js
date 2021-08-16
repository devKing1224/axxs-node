const {expect,assert} = require("chai");
const FamilyService = require("../axxs-api/services/familyService");
const fakedb = require("./fakedatabase");

describe('familyService',()=>{
    let fakedatabase = new fakedb();
    const props = {database:fakedatabase };
    FamilyService.init(props);
    describe('init',()=>{
        it('inits',()=>{
            expect(FamilyService.database).to.equal(fakedatabase);
        });
    });
    describe('getPaymentInformationData',()=>{
        FamilyService.database.PaymentInformations.findAll = ()=>{
            return {foo:"foo"}
        };
        it('will return payment info', async()=>{
            let paymentInformationData = await FamilyService.getPaymentInformationData(1234);
            expect(paymentInformationData.foo).to.equal("foo");
        });
    });

});
