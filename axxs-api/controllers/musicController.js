"use strict";
const Joi = require("@hapi/joi");
const MusicService = require("../services/musicService");
const { isEmpty } = require("../utils/");
const commonLang = require("../lang/en/common");
const musicLang = require("../lang/en/music");
const { uuid } = require('uuidv4');
const Sentry = require('@sentry/node');

let controller = {};

controller.addMusic = async (request, h) => {
  request.server.app.logger.info("addMusic");

  try {
    const { payload } = request;
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

    let types = /(\.|\/)(mp3)$/i;
    request.server.app.logger.info(request.payload);
    let fileName = request.payload.music_file.hapi.filename;

    request.server.app.logger.info(`filename to upload:${fileName}`);

    if (!types.test(fileName)) {
      let response = h.response({
        Code: 400,
        error: "Bad Request",
        message: "Invalid file type request query input"
      });
      response.type("application/json");
      return response;
    }

    const s3FileName = uuid()+'.mp3';

    await MusicService.upload(request.payload.music_file._data, s3FileName);

    await MusicService.createMusic(payload, s3FileName);
    let response = h.response({
      Code: 200,
      Status: commonLang.success,
      Message: musicLang.music_created
    });

    response.type("application/json");
    return response;
  } catch (e) {
    request.server.app.logger.error(e.message);
    let response = h.response({
      Code: 500,
      Status: commonLang.success,
      Message: musicLang.music_update_error
    });
    return response;
  }
};

controller.editMusicList = async (request, h) => {
  try {
    const { payload } = request;

    MusicService.init({
      database: request.server.app.database,
      logger: request.server.app.logger
    });
    if (!request.params.id) {
      let response = h.response({
        Code: 400,
        error: "Bad Request",
        message: "No parameters for edit"
      });
      response.type("application/json");
      return response;
    }
    let types = /(\.|\/)(mp3)$/i;
    let fileName = payload.music_file;

    if (!types.test(fileName)) {
      let response = h.response({
        Code: 400,
        error: "Bad Request",
        message: "Invalid file type request query input"
      });
      response.type("application/json");
      return response;
    }
    let user = true;

    if (user) {
      MusicService.editMusic(payload, request.params.id);
      let response = h.response({
        Code: 200,
        Status: commonLang.success,
        Message: musicLang.music_update
      });

      response.type("application/json");
      return response;
    } else {
      let response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_created
      });
      response.type("application/json");
      return response;
    }
  } catch (error) {
    return resp.response(error).code(500);
  }
};

controller.getMusicListByGenre = async (request, h) => {
  request.server.app.logger.info("getMusicByGenre");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });
      const getmusic = await MusicService.getMusicByGenre(request.payload.genre, request.payload.keyword);
      if (getmusic) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_details,
          Data: getmusic
        });
        response.type("application/json");
        return response;
      } else {
        const response = h.response({
          Code: 400,
          Status: commonLang.success,
          Message: musicLang.music_not_found_id
        });
        response.type("application/json");
        return response;
      }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.getGenres = async (request, h) => {
  request.server.app.logger.info("getGenreList");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

      const genreList = await MusicService.getGenreList();
      if (genreList) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_get_genres,
          Data: genreList
        });
        response.type("application/json");
        return response;
      }

      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_found
      });
      response.type("application/json");
      return response;

  } catch (e) {
    request.server.app.logger.error(e.message);
    Sentry.init({ dsn: request.server.config.sentryDsn, environment: request.server.config.env });
    Sentry.captureException(e);
    const response = h.response({
      Code: 500,
      Status: commonLang.failure,
      Message: e.message
    });
    response.type("application/json");
    return response;
  }
};

controller.getMusicList = async (request, h) => {
  request.server.app.logger.info("getMusicList");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

    const user = true;

    if (user) {
      const musicList = await MusicService.getMusicList();
      if (musicList) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_details,
          Data: musicList
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_found
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};
controller.getInactiveMusicList = async (request, h) => {
  request.server.app.logger.info("getInactiveMusicList");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });


    const user = true;
    if (user) {
      const inactiveMusicList = await MusicService.getInactiveMusicList();

      if (inactiveMusicList) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_details,
          Data: inactiveMusicList
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_found
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};
controller.activateMusic = async (request, h) => {
  request.server.app.logger.info("activateMusic");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

    const user = true;
    if (user) {
      const activateMusic = await MusicService.activateMusic(request.params.id);
      if (activateMusic) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_activated
        });
        response.type("application/json");
        return response;
      } else {
        const response = h.response({
          Code: 400,
          Status: commonLang.success,
          Message: musicLang.music_not_updated
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_updated
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};
controller.deactivateMusic = async (request, h) => {
  request.server.app.logger.info("deactivateMusic");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

    const user = true;
    if (user) {
      const activateMusic = await MusicService.deactivateMusic(
        request.params.id
      );
      if (activateMusic) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_deactivated
        });
        response.type("application/json");
        return response;
      } else {
        const response = h.response({
          Code: 400,
          Status: commonLang.success,
          Message: musicLang.music_not_updated
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_updated
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.uploadMusic = async (request, h) => {
  request.server.app.logger.info('uploadMusic');
  let responseFile = null;
  try {
    if (request.payload.music_file.hapi) {
      let types = /(\.|\/)(mp3)$/i;
      let fileName = request.payload.music_file.hapi.filename;
      request.server.app.logger.info(`filename to upload:${fileName}`);
      if (!types.test(fileName)) {
        let response = h.response({
          Code: 400,
          error: "Bad Request",
          message: "Invalid file type request query input"
        });
        response.type("application/json");
        return response;
      }
      request.server.app.logger.info('file is mp3 attempting upload...');
      let resp = await upload(request.payload.music_file);
      if(resp){
        request.server.app.logger.info(resp)
        responseFile = { fileUrl: resp.Location };
      } else {
        request.server.app.logger.info('unable to get response')
        throw new Error('error occurred during upload');
      }
    } else {
      request.server.app.logger.info(request.payload.music_file.hapi);
    }
    MusicService.init({
      database: request.server.app.database, logger:request.server.app.logger
    });
    const { payload } = request;
    let insert = await MusicService.createMusicUpload(
      payload,
      responseFile.fileUrl
    );
    if (insert) {
      request.server.app.logger.info('file added successfully');
      let response = h.response({
        Code: 200,
        Status: commonLang.success,
        Data: responseFile.fileUrl,
        Message: musicLang.music_created
      });

      response.type("application/json");
      return response;
    } else {
      request.server.app.logger.error(`error while uploading mp3:${musicLang.music_exist}`);
      let response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_exist
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e.message);
  }
};

controller.editUploadMusic = async (request, h) => {
  try {
    if (!request.params.id) {
      let response = h.response({
        Code: 400,
        error: "Bad Request",
        message: "No parameters for edit"
      });
      response.type("application/json");
      return response;
    }
    // let types = /(\.|\/)(mp3)$/i;
    // let fileName = request.payload.music_file.hapi.filename;
    // if (!types.test(fileName)) {
    //   let response = h.response({
    //     Code: 400,
    //     error: "Bad Request",
    //     message: "Invalid file type request query input"
    //   });
    //   response.type("application/json");
    //   return response;
    // }
    // let responseFile = null;
    // if (request.payload.music_file.hapi) {
    // await upload(request.payload.music_file)
    //   .then(resp => {
    //     responseFile = { fileUrl: resp.Location };
    //   })
    //   .catch(err => {
    //     responseFile = err.message;
    //   });
    //   request.payload.music_file.pipe(
    //     fs.createWriteStream(
    //       __dirname + "/../uploads/" + request.payload.music_file.hapi.filename
    //     )
    //   );
    // }
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

    let user = true;
    const { payload } = request;

    if (user) {
      MusicService.editMusic(payload, request.params.id);

      let response = h.response({
        Code: 200,
        Status: commonLang.success,
        // Data: responseFile.fileUrl,
        Message: musicLang.music_update
      });

      return response;
    } else {
      let response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: music_created.music_not_created
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.getmusicbyid = async (request, h) => {
  request.server.app.logger.info("getMusicByID");
  try {
    MusicService.init({
      database: request.server.app.database,
      logger:request.server.app.logger
    });

    const user = true;
    if (user) {
      const getmusic = await MusicService.getmusicbyid(request.params.id);
      if (getmusic) {
        const response = h.response({
          Code: 200,
          Status: commonLang.success,
          Message: musicLang.music_details,
          Data: getmusic
        });
        response.type("application/json");
        return response;
      } else {
        const response = h.response({
          Code: 400,
          Status: commonLang.success,
          Message: musicLang.music_not_found_id
        });
        response.type("application/json");
        return response;
      }
    } else {
      const response = h.response({
        Code: 400,
        Status: commonLang.success,
        Message: musicLang.music_not_updated
      });
      response.type("application/json");
      return response;
    }
  } catch (e) {
    request.server.app.logger.error(e);
  }
};

controller.routes = [
  {
    method: "POST",
    path: "/addmusic",
    config: {
      handler: controller.addMusic,
      validate: {
        payload: Joi.object({
          song_id: Joi.string()
            .trim()
            .required(),
          music_file: Joi.string()
            .trim()
            .required(),
          song_name: Joi.string()
            .trim()
            .required(),
          artist_name: Joi.string()
            .trim()
            .required(),
          genre_name: Joi.string().optional()
        })
      },
      auth: {
        strategies: ["ios", "backoffice"]
      },
      cors: true
    }
  },
  {
    method: "GET",
    path: "/getmusiclist",
    config: {
      handler: controller.getMusicList,
      cors: true
    }
  },
  {
    method: "GET",
    path: "/inactivemusiclist",
    config: {
      handler: controller.getInactiveMusicList,
      cors: true
    }
  },
  {
    method: "PUT",
    path: "/editmusiclist/{id}",
    config: {
      handler: controller.editMusicList,
      validate: {
        payload: Joi.object({
          song_id: Joi.string()
            .trim()
            .required(),
          music_file: Joi.string()
            .trim()
            .required(),
          song_name: Joi.string()
            .trim()
            .required(),
          artist_name: Joi.string()
            .trim()
            .required(),
          genre_name: Joi.string().optional(),
          is_deleted: Joi.string().optional()
        })
      },
      cors: true
    }
  },
  {
    method: "POST",
    path: "/upload_music",
    config: {
      payload: {
        output: "stream",
        allow: "multipart/form-data",
        maxBytes: 1000 * 1000 * 60,
        parse: true,
        timeout: 120000
      },
      timeout: {socket:false}

    },
    handler: controller.addMusic
  },
  {
    method: "PUT",
    path: "/edit_upload_music/{id}",
    config: {
      payload: {
        // output: "stream",
        output: "data"
        // parse: true,
        // allow: "form-data"
        // maxBytes: 10 * 1000 * 1000
      }
    },

    handler: controller.editUploadMusic
  },
  {
    method: "PUT",
    path: "/create_music_activate/{id}",
    config: {
      handler: controller.activateMusic,
      cors: true
    }
  },
  {
    method: "PUT",
    path: "/create_music_deactivate/{id}",
    config: {
      handler: controller.deactivateMusic,
      cors: true
    }
  },
  {
    method: "GET",
    path: "/getmusicby_id/{id}",
    config: {
      handler: controller.getmusicbyid,
      cors: true
    }
  },
  {
    method: "POST",
    path: "/getmusicbygenre",
    config: {
      handler: controller.getMusicListByGenre,
      validate: {
        payload: Joi.object({
          genre: Joi.string()
              .required(),
          keyword: Joi.string()
              .trim()
        })
      },
      cors: true
    }
  },
  {
    method: "GET",
    path: "/getgenres",
    config: {
      handler: controller.getGenres,
      cors: true
    }
  }
];

module.exports = controller;
