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
      console.log(`Raw cached data: ${cachedData.substring(0, 100)}...`); // Log first 100 chars
      try {
        const parsed = JSON.parse(cachedData);
        return parsed;
      } catch (parseError) {
        console.error(`Failed to parse JSON for key ${key}:`, parseError);
        return null;
      }
    } else {
      console.log(`❌ CACHE MISS for key: ${key}`);
      return null;
    }
  } catch (error) {
    console.error(`Redis cache get error for key ${key}:`, error);
    return null;
  }
};

const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  const redisClient = getRedisClient();
  
  if (!redisClient) {
    console.log('Redis client is null, cannot set cache');
    return false;
  }
  
  try {
    console.log(`Setting cache for key: ${key}, TTL: ${ttl}`);
    
    // Ensure value doesn't contain functions or circular references
    const cleanedValue = JSON.parse(JSON.stringify(value));
    const serializedValue = JSON.stringify(cleanedValue);
    
    // Log a sample of the data being cached for debugging
    console.log(`Caching data sample for ${key}: ${serializedValue.substring(0, 100)}...`);
    
    await redisClient.set(key, serializedValue, 'EX', ttl);
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