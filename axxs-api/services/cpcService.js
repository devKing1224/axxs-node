class CpcService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getAllowUrlsData() {
    const allowUrlsData = await this.database.AllowUrls.findAll({
      where: { is_deleted: 0 },
      attributes: ["url"]
    });

    return allowUrlsData;
  }
}

module.exports = new CpcService();
