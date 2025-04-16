const config = require('../config');
const Redis = require('ioredis');

class QueueService {
  constructor() {
    this.redis = null;
    if (config.redis.enabled) {
      try {
        this.redis = new Redis({
          port: config.redis.port,
          host: config.redis.host,
          password: config.redis.password,
          retryStrategy: () => null // Disable retries
        });
        
        this.redis.on('error', (err) => {
          console.error('Queue service error:', err.message);
          this.redis = null;
        });
      } catch (error) {
        console.error('Queue service initialization failed:', error.message);
      }
    }
  }

  async addToQueue(data) {
    if (!this.redis) return;
    try {
      await this.redis.lpush('orders', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to add to queue:', error.message);
    }
  }
}

module.exports = new QueueService();
