require('dotenv').config()
const Redis = require('ioredis')

class RedisClient {
  constructor() {
    this.client = null
    this.enabled = process.env.REDIS_HOST && process.env.REDIS_PORT ? true : false
  }

  connect() {
    if (!this.enabled) {
      console.log('Redis is disabled by configuration')
      return
    }

    try {
      this.client = new Redis({
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST || 'localhost',
        maxRetriesPerRequest: 1,
        retryStrategy: () => null // Disable retries
      })

      this.client.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          console.log('Redis server not available, disabling Redis')
          this.enabled = false
          this.client = null
        }
      })
    } catch (error) {
      console.log('Redis initialization failed:', error.message)
      this.enabled = false
    }
  }

  getInstance() {
    return this.client
  }

  isEnabled() {
    return this.enabled && this.client !== null
  }
}

const redis = new RedisClient()
redis.connect()

module.exports = redis
