require('dotenv').config()

module.exports = {
  port: parseInt(process.env.PORT) || 4000,
  mongodb: {
    uri: process.env.CONNECTION_STRING || 'mongodb+srv://emilejoelson:kj4CICHtosKgluMZ@cluster0.i3iyk4h.mongodb.net/annahna?retryWrites=true&w=majority'
  },
  redis: {
    enabled: process.env.REDIS_HOST ? true : false,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD
  }
}
