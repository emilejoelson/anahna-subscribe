const Bull = require("bull");
const { redisOptions } = require("./redis.js");

module.exports = { Bull, redisOptions };
