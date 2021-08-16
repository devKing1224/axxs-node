const { axss: axssConstants } = require("../constants/");

class MoviesService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getMovieList() {
    const movieListData = await this.database.Movies.findAll({
      where: { is_deleted: 0 }
    });
    return movieListData;
  }

  async getMovieById(movieId) {
    const movieListData = await this.database.Movies.findOne({
      where: { id: movieId }
    });
    return movieListData;
  }
}

module.exports = new MoviesService();
