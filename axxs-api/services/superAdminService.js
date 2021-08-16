class superAdminService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getAPIurlData() {
    const apiUrls = await this.database.InmateConfigurations.findAll({
      where: {
        key: ["pro_api_url", "qa_api_url"],
        is_active: 1
      }
    });
    return apiUrls;
  }
  async getProAPIurlData() {
    const apiUrls = await this.database.InmateConfigurations.findOne({
      where: {
        key: ["pro_api_url"],
        is_active: 1
      }
    });
    return apiUrls;
  }
  async getQaAPIurlData() {
    const apiUrls = await this.database.InmateConfigurations.findOne({
      where: {
        key: ["qa_api_url"],
        is_active: 1
      }
    });
    return apiUrls;
  }
  async getTestAPIurlData() {
    const apiUrls = await this.database.InmateConfigurations.findOne({
      where: {
        key: ["test_api_url"],
        is_active: 1
      }
    });
    return apiUrls;
  }
}

module.exports = new superAdminService();
