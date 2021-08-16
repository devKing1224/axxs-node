const {expect,assert} = require("chai");
const FulfillmentService = require("../axxs-api/services/fulfillmentService");
const fakedb = require("./fakedatabase");
const fakeLogger = require("./fakelogger");
describe('fulfillmentService',()=>{
    let fakedatabase = new fakedb();
    let fakelogger = new fakeLogger()
    const props = {database:fakedatabase, logger:fakelogger };
    FulfillmentService.init(props);

    describe('init',()=>{
        it('inits',()=>{
            expect(FulfillmentService.database).to.equal(fakedatabase);
            expect(FulfillmentService.logger).to.equal(fakelogger);
        });
    });

    describe('updateBalance',()=>{
        let inmate = [];
        inmate.push({balance:30});
        FulfillmentService.database.sequelize.query =()=>{return inmate;};
        FulfillmentService.database.Users.update=()=>{};

        it('will increase balance by one dollar', async()=>{
            let newBalance = await FulfillmentService.updateBalance(1234, "foo", 1);
            expect(newBalance).to.equal(31);
        });

        it('will decrease balance by one dollar', async()=>{
            let newBalance = await FulfillmentService.updateBalance(1234, "foo", -1);
            expect(newBalance).to.equal(29);
        });

        it('will decrease balance by four cents', async()=>{
            let newBalance = await FulfillmentService.updateBalance(1234, "foo", -0.04);
            expect(newBalance).to.equal(29.96);
        });

        it('will increase balance by four cents', async()=>{
            let newBalance = await FulfillmentService.updateBalance(1234, "foo", 0.04);
            expect(newBalance).to.equal(30.04);
        });
    });

    describe('addToPurchaseInmates', ()=>{
        let purchaseData={};
        purchaseData.site_id = 'foo';
        purchaseData.transaction_id = 'bar';

        FulfillmentService.database.PurchaseInmates.create = ()=>{return 'foo'};
        it('will call create for a PurchaseInmates record', async()=>{
            let result = await FulfillmentService.addToPurchaseInmates(purchaseData);
            expect(result).to.equal('foo');
        })
    })

});
