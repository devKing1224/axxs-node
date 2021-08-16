"use strict";
const Joi = require("@hapi/joi");
const MoviesService = require("../services/moviesService");
const commonLang = require("../lang/en/common");
const movieLang = require("../lang/en/movies");

let controller = {};

controller.getMovies = async (request, h) => {
  request.server.app.logger.info("getMovies");
  try {
    MoviesService.init({
      database: request.server.app.database
    });

    const movieList = await MoviesService.getMovieList();
    if (movieList) {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: movieLang.movie_details,
        Data: movieList
      });
      response.type("application/json");
      return response;
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.failure,
        Message: movieLang.movie_not_found
      });
      response.type("application/json");
      request.server.app.logger.error(movieLang.movie_not_found);
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(movieLang.movie_500_list);
    request.server.app.logger.error(e);
    const response = h.response({
      Code: 500,
      Status: commonLang.failure,
      Message: movieLang.movie_500_list
    });
    response.type("application/json");
    return response;
  }
};

controller.getMovieById = async (request, h) => {
  request.server.app.logger.info("getMovieById");
  try {
    MoviesService.init({
      database: request.server.app.database
    });
    const movie = await MoviesService.getMovieById(request.params.id);
    if (movie) {
      const response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: movieLang.movie_details,
        Data: getmovie
      });
      response.type("application/json");
      return response;
    } else {
      request.server.app.logger.error(movieLang.movie_not_found_id);
      const response = h.response({
        Code: 400,
        Status: commonLang.failure,
        Message: movieLang.movie_not_found_id
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(movieLang.movie_500);
    request.server.app.logger.error(e);
    const response = h.response({
      Code: 400,
      Status: commonLang.failure,
      Message: movieLang.movie_500
    });
    response.type("application/json");
    return response;
  }
};

controller.routes = [
  {
    method: "GET",
    path: "/getMovies",
    config: {
      handler: controller.getMovies,
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  },
  {
    method: "GET",
    path: "/getMovie/{id}",
    config: {
      handler: controller.getMovieById,
      validate :{
        params:{
          id: Joi.number().required()
        }
      },
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  }
];

module.exports = controller;
