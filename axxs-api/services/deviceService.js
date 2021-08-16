class DeviceService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getDeviceData(payload) {
    this.database.Devices.belongsTo(this.database.Facilities)
    const deviceFacility = await this.database.Devices.findOne({
      where: { imei: payload.device_imei },
      include:[
        {model: this.database.Facilities}
      ]
    })  
    return deviceFacility
  }
}

module.exports = new DeviceService();
