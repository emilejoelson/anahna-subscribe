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
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY'
          if (err.message.includes(targetError)) {
            return true
          }
          return false
        }
      })

      this.client.on('connect', () => {
        console.log('Successfully connected to Redis')
      })

      this.client.on('error', (err) => {
        console.error('Redis error:', err)
        if (err.code === 'ECONNREFUSED') {
          console.log('Redis server not available, will retry connecting')
        }
      })

      this.client.on('ready', () => {
        console.log('Redis client ready')
      })

    } catch (error) {
      console.error('Redis initialization failed:', error.message)
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
