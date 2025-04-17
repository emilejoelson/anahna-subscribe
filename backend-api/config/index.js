require('dotenv').config()

module.exports = {
  port: parseInt(process.env.PORT) || 4000,
  mongodb: {
    uri: process.env.CONNECTION_STRING || 'mongodb://localhost:27017/anahna'
  },
  redis: {
    enabled: process.env.REDIS_HOST ? true : false,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD
  }
}
