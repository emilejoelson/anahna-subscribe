const dotenv = require("dotenv");
dotenv.config();

const redisOptions = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
};

module.exports = { redisOptions };
