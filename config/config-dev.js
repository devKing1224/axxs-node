module.exports = (function() {
  this.logLevel = "debug";

  this.hapiServerInfo = {
    port: 3000,
    host: "0.0.0.0"
  };

  this.axxs_db = {
    url: "localhost",
    port: "13306",
    dbName: "tbone_axxs",
    dbUser: "root",
    dbPass: "supersecretpass",
    dialect: "mysql"
  };

  this.log_path = "/tmp";

  return this;
})();
