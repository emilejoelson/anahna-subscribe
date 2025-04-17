require('dotenv').config()
const Redis = require('ioredis');

class QueueService {
  constructor() {
    this.redis = null;
    if (process.env.REDIS_ENABLED && process.env.REDIS_PORT) {
      try {
        this.redis = new Redis({
          port: process.env.REDIS_PORT || 6379,
          host: process.env.REDIS_HOST || 'localhost',
          password: process.env.REDIS_PASSWORD,
          retryStrategy: (times) => {
            if (times > 3) {
              console.log('Redis connection failed after 3 retries, disabling queue service');
              return null; // Stop retrying
            }
            return Math.min(times * 100, 3000); // Wait up to 3 seconds between retries
          }
        });
        
        this.redis.on('error', (err) => {
          console.error('Queue service error:', err.message);
          if (err.code === 'ECONNREFUSED' || err.code === 'ERR_SOCKET_BAD_PORT') {
            console.log('Redis connection failed, disabling queue service');
            this.redis = null;
          }
        });

        this.redis.on('connect', () => {
          console.log('Queue service connected to Redis successfully');
        });
      } catch (error) {
        console.error('Queue service initialization failed:', error.message);
        this.redis = null;
      }
    } else {
      console.log('Queue service disabled: Redis not configured');
    }
  }

  async addToQueue(data) {
    if (!this.redis) {
      console.log('Queue service is disabled, skipping queue operation');
      return;
    }
    try {
      await this.redis.lpush('orders', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to add to queue:', error.message);
    }
  }
}

module.exports = new QueueService();
