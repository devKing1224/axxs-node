'use strict';

module.exports = function () {
    var table = {
        QueryTypes: { SELECT: {} },
        find: function () { },
        findAll: function () { },
        update: function () { },
        create: function () { },
        findOne: function () { },
        destroy: function () { },
        max: function () { },
        bulkCreate: function () { },
        query: function () { },
        fn: function () {},
        col: function () { },
        belongsTo:function () { },

        transaction: function() {
            return new Promise((resolve, reject) => {
                resolve({
                    rollback: ()=>{},
                    commit: ()=>{}
                });
            });
        },
        convertToUTC: function() {}
    };
    this.Devices = Object.create(table);
    this.AllowUrls = Object.create(table);
    this.PaymentInformations = Object.create(table);
    this.InmateActivityHistory = Object.create(table);
    this.PurchaseInmates = Object.create(table);
    this.Users = Object.create(table);
    this.ServiceChargeByFacilities = Object.create(table);
    this.FlatRateServices = Object.create(table);
    this.Services = Object.create(table);
    this.ServiceHistory = Object.create(table);
    this.sequelize = {query:function () {}};
    this.sequelize.QueryTypes= { SELECT: {} };
    return this;
};
