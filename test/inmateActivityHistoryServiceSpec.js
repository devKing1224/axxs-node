const {expect, assert} = require("chai");
const InmateActivityHistoryService = require("../axxs-api/services/inmateActivityHistoryService");
const fakedb = require("./fakedatabase");
let fakedatabase = new fakedb();
const sinon = require('sinon');
InmateActivityHistoryService.init({database: fakedatabase});

describe('inmateActivityHistoryService', () => {

    describe('init', () => {
        it('inits', () => {
            expect(InmateActivityHistoryService.database).to.equal(fakedatabase);
        });
    });

    describe('updateServiceHistoryData', async () => {
        it('returns false when no data is sent', async () => {
            let result = await InmateActivityHistoryService.updateServiceHistoryData();
            expect(result).to.equal(false);
        });
        it('returns status data is sent', async () => {
            let serviceHistoryData = {id: 1, updateData: []}
            InmateActivityHistoryService.database.ServiceHistory.update = () => {
                return "foo"
            };
            let result = await InmateActivityHistoryService.updateServiceHistoryData(serviceHistoryData);
            expect(result).to.equal("foo");
        })
    });

    describe('getUserBalanceData', async () => {
        it('will return user balance data', async () => {
            InmateActivityHistoryService.database.Users.findOne = () => {
                return "foo"
            };

            let userBalanceData = await InmateActivityHistoryService.getUserBalanceData(1);
            expect(userBalanceData).to.equal("foo")
        })
    });

    describe('createInmateActivityHistoryData', async () => {
        it('returns result', async () => {
            InmateActivityHistoryService.database.InmateActivityHistory.create = () => {
                return "foo"
            };
            let result = await InmateActivityHistoryService.createInmateActivityHistoryData(1);
            expect(result).to.equal("foo")
        })
    });

    describe('getUserData', async () => {
        it('will return user data', async () => {
            InmateActivityHistoryService.database.Users.findOne = () => {
                return "foo"
            };

            let userData = await InmateActivityHistoryService.getUserData(1);
            expect(userData).to.equal("foo")
        })
    });

    describe('getInmateActivityHistory', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.InmateActivityHistory.findOne = async () => {
                return "foo"
            };
            let history = await InmateActivityHistoryService.getInmateActivityHistory(1);
            expect(history).to.equal("foo");
        })
    });


    describe('getFacilityServiceChargeData', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.ServiceChargeByFacilities.findOne = () => {
                return "foo"
            }
            let result = await InmateActivityHistoryService.getFacilityServiceChargeData({});
            expect(result).to.equal("foo");
        })
    });

    describe('getServiceData', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.Services.findOne = () => {
                return "foo"
            }
            let result = await InmateActivityHistoryService.getServiceData({});
            expect(result).to.equal("foo");
        })
    });

    describe('getServiceData', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.Services.findOne = () => {
                return "foo"
            }
            let result = await InmateActivityHistoryService.getServiceData({});
            expect(result).to.equal("foo");
        })
    })

    describe('getFlatRateServiceData', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.FlatRateServices.findOne = () => {
                return "foo"
            }
            let result = await InmateActivityHistoryService.getFlatRateServiceData(1, {inmate_id: 1});
            expect(result).to.equal("foo");
        })
    });

    describe('createFlatRateServiceData', async () => {
        it('will return data after create', async () => {
            InmateActivityHistoryService.database.FlatRateServices.create = () => {
                return "foo"
            }
            let result = await InmateActivityHistoryService.createFlatRateServiceData("foo");
            expect(result).to.equal("foo");
        })
    });

    describe('getInmateActivityHistoryNew', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.sequelize.query = async () => {
                return "foo"
            };
            let allTypeService = await InmateActivityHistoryService.getInmateActivityHistoryNew(1)
            expect(allTypeService).to.equal("foo");
        })
    });

    describe('decreaseUserBalance', async () => {
        it('balance is decreased', async () => {
            let userData = {
                dataValues: {balance: 1}, update: () => {
                }
            };
            sinon.spy(userData, "update");
            InmateActivityHistoryService.database.Users.findOne = () => {
                return userData
            };

            await InmateActivityHistoryService.decreaseUserBalance(1, 1);

            let spyCall = userData.update.getCall(0);
            expect(spyCall.args[0].balance).to.equal(0);
        })
    });

    describe('getServiceHistoryData', async () => {
        it('will return data', async () => {
            InmateActivityHistoryService.database.ServiceHistory.findOne = async () => {
                return "foo"
            };
            let result = await InmateActivityHistoryService.getServiceHistoryData(1);
            expect(result).to.equal("foo");
        })
    });

    describe('createServiceHistoryData', async () => {
        it('will create data', async () => {
            InmateActivityHistoryService.database.ServiceHistory.create = () => {
                return "foo"
            }
            let result = await InmateActivityHistoryService.createServiceHistoryData({});
            expect(result).to.equal("foo");
        })
    });

});
