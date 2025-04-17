require('dotenv').config()

module.exports = {
  port: parseInt(process.env.PORT) || 4000,
  mongodb: {
    uri: process.env.CONNECTION_STRING || 'mongodb://localhost:27017/anahna'
  },
  redis: {
    enabled: process.env.REDIS_HOST && process.env.REDIS_PORT ? true : false,
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : null,
    password: process.env.REDIS_PASSWORD || undefined
  }
}
