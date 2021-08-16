"use strict";
const NewsService = require("../services/newsService");
const commonLang = require("../lang/en/common");
const Joi = require("@hapi/joi");


let controller = {};

controller.getNewsSettings = async (request, h) => {
    request.server.app.logger.info("getNewsSettings");
    try {
        NewsService.init({
            database: request.server.app.database
        });

        const newsSettings = await NewsService.getNewsSettings(request.params.facility_id);

        const response = h.response({
            Code: 200,
            Status: commonLang.success,
            Data: newsSettings,
            Message: `news settings for ${request.params.facility_id}`
        });
        response.type("application/json");
        return response;
    } catch (e) {
        request.server.app.logger.error(e);
        const response = h.response({
            Code: 500,
            Status: commonLang.success,
            Message: e.message || e.Message
        });
        response.type("application/json");
        return response;
    }
};

controller.getNews = async (request, h)=>{
    request.server.app.logger.info("getNews");
    try{
        NewsService.init({
            database: request.server.app.database
        });
        let result = await NewsService.getNews(request.params.category, request.params.limit);
        const response = h.response({
            Code: 200,
            Status: commonLang.success,
            Data: result.data,
            Message: `news for category ${request.params.category}`
        });
        response.type("application/json");
        return response;
    } catch (e) {
        request.server.app.logger.error(e);
        const response = h.response({
            Code: 500,
            Status: commonLang.success,
            Message: e.message || e.Message
        });
        response.type("application/json");
        return response;
    }
};


controller.searchNews  = async (request, h)=>{
    request.server.app.logger.info("searchNews");
    try{
        NewsService.init({
            database: request.server.app.database
        })
        let result = await NewsService.searchNews(request.payload.keywords, request.payload.limit);
        const response = h.response({
            Code: 200,
            Status: commonLang.success,
            Data: result.data,
            Message: `news search for category ${request.payload.keywords}`
        });
        response.type("application/json");
        return response;
    } catch (e) {
        request.server.app.logger.error(e);
        const response = h.response({
            Code: 500,
            Status: commonLang.success,
            Message: e.message || e.Message
        });
        response.type("application/json");
        return response;
    }
};

controller.routes = [
    {
        method: "GET",
        path: "/newssettings/{facility_id}",
        config: {
            handler: controller.getNewsSettings,
            validate :{
                params:{
                    facility_id: Joi.number().required()
                }
            },
            auth: {
                strategies: ["ios", "backoffice"]
            },
            cors: true
        }
    },
    {
        method: "GET",
        path: "/getNews/{category}/{perPage}",
        config: {
            handler: controller.getNews,
            validate :{
                params:{
                    category: Joi.string().required(),
                    perPage: Joi.number().required()
                }
            },
            auth: {
                strategies: ["ios", "backoffice"]
            },
            cors: true
        }
    },
    {
        method: "POST",
        path: "/searchNews",
        config: {
            handler: controller.searchNews,
            validate :{
                payload:{
                    keywords: Joi.string().required(),
                    limit: Joi.number().required()
                }
            },
            auth: {
                strategies: ["ios", "backoffice"]
            },
            cors: true
        }
    },
];

module.exports = controller;
