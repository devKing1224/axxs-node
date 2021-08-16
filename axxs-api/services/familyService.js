class FamilyService {
  init(props) {
    if (!this.database) {
      this.database = props.database;
    }
  }

  async getPaymentInformationData(inmateId) {
    const paymentInformationData = await this.database.PaymentInformations.findAll(
      {
        where: { inmate_id: inmateId },
        attributes: [
          "id",
          "family_id",
          ["client_name", "family_name"],
          "amount",
          "inmate_id"
        ]
      }
    );
    return paymentInformationData;
  }
}

module.exports = new FamilyService();
