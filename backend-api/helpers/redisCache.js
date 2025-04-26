const { getRedisClient } = require('../config/redis');

const DEFAULT_TTL = parseInt(process.env.REDIS_TTL) || 3600; 

const getCache = async (key) => {
  const redisClient = getRedisClient();
  console.log(`Attempting to get cache for key: ${key}`);
  
  if (!redisClient) {
    console.log('Redis client is null, cannot get cache');
    return null;
  }
  
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log(`✅ CACHE HIT for key: ${key}`);
      return JSON.parse(cachedData);
    } else {
      console.log(`❌ CACHE MISS for key: ${key}`);
      return null;
    }
  } catch (error) {
    console.error(`Redis cache get error for key ${key}:`, error);
    return null;
  }
};

const setCache = async (key, data, ttl = DEFAULT_TTL) => {
  const redisClient = getRedisClient();
  console.log(`Attempting to set cache for key: ${key}`);
  
  if (!redisClient) {
    console.log('Redis client is null, cannot set cache');
    return false;
  }
  
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    console.log(`✅ Cache set successfully for key: ${key}`);
    return true;
  } catch (error) {
    console.error(`Redis cache set error for key ${key}:`, error);
    return false;
  }
};

const deleteCache = async (key) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    console.log(`✅ Cache deleted for key: ${key}`);
    return true;
  } catch (error) {
    console.error(`Redis cache delete error for key ${key}:`, error);
    return false;
  }
};

const clearCachePattern = async (pattern) => {
  const redisClient = getRedisClient();
  if (!redisClient) return false;
  
  try {
    let cursor = 0;
    let deletedKeys = 0;
    
    do {
      const scan = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = parseInt(scan.cursor);
      
      if (scan.keys.length > 0) {
        await redisClient.del(scan.keys);
        deletedKeys += scan.keys.length;
      }
    } while (cursor !== 0);
    
    console.log(`✅ Cleared ${deletedKeys} keys matching pattern: ${pattern}`);
    return true;
  } catch (error) {
    console.error(`Redis cache clear pattern error for pattern ${pattern}:`, error);
    return false;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCachePattern
};