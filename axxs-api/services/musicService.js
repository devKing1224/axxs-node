const { axss: axssConstants } = require("../constants/");
const aws = require("aws-sdk"); // import aws-sdk
const env = process.env.NODE_ENV || "dev";
const config_name = "config-" + env;
let config = require("./../../config/" + config_name);
config.env = env;
let s3;
class MusicService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
      this.logger = props.logger;
    }
    // this.logger.info(JSON.stringify(config.aws));
    this.logger.info(config.musicBucket);
    aws.config.update(config.aws);
    s3 = new aws.S3({
      apiVersion: "2012-10-17",
      params: { Bucket: config.musicBucket }
    });
  }

  async upload(musicData, filename) {
    const options = { partSize: 10 * 1024 * 1024, queueSize: 3 };
    const params = {
      Bucket: config.musicBucket,
      Key: filename,
      Body: musicData
    };
    return await s3.upload(params, options, function(err, data) {
      if (err) {
        throw new Error(err.message)
      } else {
        console.log("Successfully uploaded data");
      }
    });
  }

  async createMusic(payload, fileName) {
    const createObj = await this.database.Music.create({
      song_url: `https://${config.musicBucket}.s3.amazonaws.com/${fileName}`,
      song: payload.song_name,
      song_file_name:'test',
      artist: payload.artist_name,
      genre: payload.genre_name,
      is_deleted: 0
    });
    return createObj;
  }
  async createMusicUpload(payload, url) {

    const checkMusicData = await this.database.Music.findAll({}).map(el =>
      el.get({ plain: true })
    );

    for (var index = 0; index < checkMusicData.length; ++index) {
      var currData = checkMusicData[index];

      if (
        currData.song == payload.song_name &&
        currData.song_file_name == payload.music_file.hapi.filename
      ) {
        return false;
      }
    }
    await this.database.Music.create({
      song: payload.song_name,
      song_file_name: payload.music_file.hapi.filename,
      song_url: url,
      artist: payload.artist_name,
      genre: payload.genre_name,
      is_deleted: 0
    });
    return true;
  }
  async editMusic(payload, musicId) {
    const checkMusicData = await this.database.Music.findOne({
      where: {
        id: musicId
      }
    });

    if (checkMusicData) {
      const updateObj = await this.database.Music.update(
        {
          song: payload.song_name,
          // song_file_name: payload.music_file.hapi.filename,
          artist: payload.artist_name,
          genre: payload.genre_name
          // song_url: url,
          // is_deleted: parseInt(payload.is_deleted)
        },
        {
          where: {
            id: parseInt(musicId)
          }
        }
      );
      return true;
    }
  }
  async getMusicList() {
    const musicListData = await this.database.Music.findAll({
      where: { is_deleted: 0 }
    });
    return musicListData;
  }

  async getGenreList() {
    const musicGenres = await this.database.Genres.findAll();
    return musicGenres;
  }

  async getMusicByGenre(genre, keyword) {
    let musicListData;
    if (genre === 'All') {
      if (keyword) {
        musicListData = await this.database.Music.findAll({
          where: {
            is_deleted: 0,
            $or: [
              {
                song: {
                  $like: '%' + keyword + '%'
                }
              },
              {
                artist: {
                  $like: '%' + keyword + '%'
                }
              }
            ]
          }
        });
      } else {
        musicListData = await this.database.Music.findAll({
          where: {is_deleted: 0}
        });
      }
    } else {
      if (keyword) {
        musicListData = await this.database.Music.findAll({
          where: {
            genre: genre, is_deleted: 0,
          $or: [
            {
              song: {
                $like: '%' + keyword + '%'
              }
            },
            {
              artist: {
                $like: '%' + keyword + '%'
              }
            }
          ]
         }
        });
      } else {
        musicListData = await this.database.Music.findAll({
          where: {genre: genre, is_deleted: 0}
        });
      }
    }
    return musicListData;
  }

  async getInactiveMusicList() {
    const inactiveMusicDatas = await this.database.Music.findAll({
      where: { is_deleted: 1 }
    });
    // .map(el => el.get({ plain: true })) to display plain data
    return inactiveMusicDatas;
  }
  async activateMusic(activateId) {
    const inactiveMusicDatas = await this.database.Music.findOne({
      where: { id: activateId }
    });

    if (inactiveMusicDatas.is_deleted == 1) {
      await this.database.Music.update(
        {
          is_deleted: 0
        },
        {
          where: {
            id: parseInt(activateId)
          }
        }
      );
      return true;
    } else {
      return false;
    }
  }
  async deactivateMusic(deactivateId) {
    const inactiveMusicDatas = await this.database.Music.findOne({
      where: { id: deactivateId }
    });

    if (inactiveMusicDatas.is_deleted == 0) {
      await this.database.Music.update(
        {
          is_deleted: 1
        },
        {
          where: {
            id: parseInt(deactivateId)
          }
        }
      );
      return true;
    } else {
      return false;
    }
  }
  async getmusicbyid(musicID) {
    const musicListData = await this.database.Music.findOne({
      where: { id: musicID }
    });
    return musicListData;
  }
}

module.exports = new MusicService();
