"use strict";
const FulfillmentService = require("../services/fulfillmentService");
let controller = {};
const Sentry = require('@sentry/node');
const Joi = require('@hapi/joi');

controller.fulfillPurchase = async (request, h) => {
    let serviceProps = {
        database: request.server.app.database,
        logger: request.server.app.logger
    };
    let responseObject = {};
    try {
        let purchaseDate = new Date();
        FulfillmentService.init(serviceProps);
        request.server.app.logger.info(`updating balance for user ${request.payload.inmate_id} with amount ${request.payload.amount}`)
        let purchaseData = {
            siteId: request.payload.site_id,
            apin: request.payload.inmate_id,
            transactionId: request.payload.transaction_id,
            amount: request.payload.amount,
            purchaseDate: purchaseDate.toDateString()
        };
        await FulfillmentService.addToPurchaseInmates(purchaseData)
        const newBalance = await FulfillmentService.updateBalance(request.payload.inmate_id, request.payload.site_id, request.payload.amount);
        responseObject.statusCode = 200;
        responseObject.message = 'success';
        responseObject.newBalance = newBalance;
    } catch (e) {
        request.server.app.logger.error(e.message);
        responseObject.statusCode=500;
        responseObject.message = e.message || `error while updating inmate ${request.payload.inmate_id} with amount ${request.payload.amount}`
        Sentry.init({ dsn: request.server.config.sentryDsn, environment: request.server.config.env });
        Sentry.configureScope((scope)=>{
            scope.setExtra("apin", request.payload.inmate_id);
            scope.setExtra("facility", request.payload.site_id);
            scope.setExtra("amount", request.payload.amount);
        });
        Sentry.captureException(e);
    }

    let response = h.response(responseObject);
    response.type("application/json");
    return response;
};

controller.routes = [
    {
        method: "post",
        path: "/fulfillPurchase",
        config: {
            handler: controller.fulfillPurchase,
            cors: true,
            validate: {
                payload: Joi.object({
                    requestId: Joi.string().required(),
                    inmate_id: Joi.string().required(),
                    site_id: Joi.string().required(),
                    amount: Joi.number().required(),
                    transaction_id: Joi.string().required()
                })
            },
            auth: {
                strategies: ["backoffice"]
            }
        }
    }
];

module.exports = controller;
