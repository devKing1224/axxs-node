const {$} = require('moneysafe');
class FulfillmentService {

    init(props) {
        if (!this.database) {
            this.database = props.database;
            this.logger = props.logger;
        }
    }

    async addToPurchaseInmates(purchaseData){
        purchaseData.product = 5;
        purchaseData.paymentType = 3;
        let result = await this.database.PurchaseInmates.create(purchaseData);
        return result;
    }

    async updateBalance(inmate_id, siteId, amount){
        this.logger.info(`updating balance for user ${inmate_id} at site: ${siteId} with amount ${amount}`);
        let inmate = await this.database.sequelize.query(
            'select * from facilitys f join users u on u.admin_id = f.facility_user_id where u.username = :inmate_id and f.facility_id = :siteId',
            {
                replacements:{
                    inmate_id:inmate_id,
                    siteId:siteId
                },
                model:this.database.Users,
                mapToModel:true
            }
        );
        if(!inmate[0]){
            throw new Error(`inmate not found in AXXS using apin : ${inmate_id}`);
        }
        const newBalance = $(amount).plus(inmate[0].balance).valueOf();
        await this.database.Users.update({balance:newBalance}, {where: {id:inmate[0].id}});
        return newBalance;
    };

}

module.exports = new FulfillmentService();
