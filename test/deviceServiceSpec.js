const {expect,assert} = require("chai");
const DeviceService = require("../axxs-api/services/deviceService");
const fakedb = require("./fakedatabase");

describe('deviceService',()=>{
    let fakedatabase = new fakedb();
    const props = {database:fakedatabase };
    DeviceService.init(props);
    describe('init',()=>{
        it('inits',()=>{
            expect(DeviceService.database).to.equal(fakedatabase);
        });
    });
    describe('getDeviceData',()=>{
        it('returns data when repo is called for imei', async ()=>{
            let payload = {device_imei:"foo"};
            DeviceService.database.Devices.findOne = ()=>{return {foo:"foo"}}

            let deviceData = await DeviceService.getDeviceData(payload);

            expect(deviceData.foo).to.equal("foo");
        })
    })
});
