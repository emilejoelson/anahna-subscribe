const { createClient } = require('redis');
require('dotenv').config();

// Redis connection configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential back-off: 1s, 2s, 4s, etc.
      return Math.min(retries * 1000, 10000);
    },
    connectTimeout: 10000
  }
};

let redisClient = null;

const connectRedis = async (retries = 5, delay = 5000) => {
  try {
    const client = createClient(redisConfig);
    
    client.on('error', (error) => {
      console.error(`❌ Redis error: ${error.message}`);
    });

    await client.connect();
    console.log('✅ Redis connected successfully');
    redisClient = client;
    return client;
  } catch (error) {
    console.error(`❌ Redis connection error: ${error.message}`);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay/1000} seconds... (${retries} attempts left)`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(connectRedis(retries - 1, delay));
        }, delay);
      });
    }
    
    console.error('Failed to connect to Redis after multiple attempts');
    console.log('⚠️ Application will continue without Redis caching');
    return null;
  }
};

module.exports = {
  connectRedis,
  getRedisClient: () => redisClient
};