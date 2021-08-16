const {expect,assert} = require("chai");
const CpcService = require("../axxs-api/services/cpcService");
const fakedb = require("./fakedatabase");

describe('cpcService',()=>{
    let fakedatabase = new fakedb();
    const props = {database:fakedatabase };
    CpcService.init(props);
    describe('init',()=>{
        it('inits',()=>{
            expect(CpcService.database).to.equal(fakedatabase);
        });
    });
    describe('getAllowUrlsData', ()=>{
        it('returns url data',async ()=>{
            CpcService.database.AllowUrls.findAll = ()=>{
                return {data:"foo"}
            }
            let allowUrlsData = await CpcService.getAllowUrlsData();
            expect(allowUrlsData.data).to.equal("foo");
        })
    })
});

