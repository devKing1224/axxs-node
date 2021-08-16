class UserService {
  init(props) {
    if (!this.database) {
      this.logger = props.logger;
      this.database = props.database;
    }
  }

  async getUserById(id) {
    this.logger.info("getting user");
    return this.database.Users.findOne({ where: { id: id } });
  }
}
module.exports = new UserService();
