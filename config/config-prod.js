module.exports = function () {
    this.logLevel = 'info';

    this.hapiServerInfo = {
        port: 3000,
        host: '0.0.0.0'
    };

    this.axxs_db = {
        url: 'ec2-3-82-14-67.compute-1.amazonaws.com',
        port:'3306',
        dbName: 'tbone_axxs',
        dialect: 'mysql'
    };

    this.log_path = '/var/log/axxs-api';

    this.musicBucket = 'cpc-axxs-music';

    return this;
}();
