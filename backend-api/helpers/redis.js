const Redis = require('ioredis')
const config = require('../config')

class RedisClient {
  constructor() {
    this.client = null
    this.enabled = config.redis.enabled
  }

  connect() {
    if (!this.enabled) {
      console.log('Redis is disabled by configuration')
      return
    }

    try {
      this.client = new Redis({
        port: config.redis.port,
        host: config.redis.host,
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
