const Sequelize = require("sequelize");
const { Op } = Sequelize; // for using sequelize operators

const crypto = require('crypto');
const env = process.env.NODE_ENV || "dev";
const config_name = "config-" + env;
let config = require("./" + config_name);
console.log("config loading " + config_name);
config.env = env;

if(env !== 'dev') {
  const pass = require(process.env.PASS_LINK);
  const secretkey = require(process.env.KEY_LINK);

  const decipher1 = crypto.createDecipher('aes192', secretkey.key);
  let dbUser = decipher1.update(pass.axxsDB.dbUser, 'hex', 'utf8');
  dbUser += decipher1.final('utf8');

  const decipher2 = crypto.createDecipher('aes192', secretkey.key);
  let dbPass = decipher2.update(pass.axxsDB.dbPass, 'hex', 'utf8');
  dbPass += decipher2.final('utf8');

  config.axxs_db.dbUser = dbUser;
  config.axxs_db.dbPass = dbPass;
}

config.apm = {
  serviceName: process.env.APM_SERVICE_NAME || "axxs-api-test",
  secretToken: process.env.APM_SECRET_TOKEN || "Eg3A0MkCsqBZa9Tdza",
  serverUrl:
    process.env.APM_SERVER_URL ||
    "https://5b99dc540ab140dd9d3a1d3e735e96a3.apm.us-east-1.aws.cloud.es.io:443"
};

config.iosSecret = process.env.IOS_SECRET || 'fd5aa304-4492-4b2a-98d6-6fbff8c6fee0';
config.backofficeSecret = process.env.BACKOFFICE_SECRET || '305026f2-58d9-419e-895f-756bebfecccf';
config.sentryDsn = 'https://45667dc0e6b84026a2d5f87d06e1b18b@sentry.io/1869481';

config.aws = {
  secretAccessKey: "QdPQxsuKYg38FYpcIcsoyiP6CEoygKnYUy3pxs0s",
  accessKeyId: "AKIAWAHHNZ2S4MLHDA36",
  region: "us-east-2"
};

config.operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};

module.exports = config;
