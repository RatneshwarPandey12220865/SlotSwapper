import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'redis-18987.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: parseInt(process.env.REDIS_PORT || '18987'),
  username: process.env.REDIS_USER || 'default',
  password: process.env.REDIS_PASSWORD || 'dRrUuvPgHnQpaS5z2ppSKi8T16rcT4tv',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('close', () => {
  console.log('Redis connection closed');
});

// Helper functions for caching
export const cache = {
  // Get cached value
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Set cached value with optional expiration (in seconds)
  set: async (key, value, expiration = 3600) => {
    try {
      await redisClient.setex(key, expiration, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  // Delete cached value
  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // Delete multiple keys matching a pattern
  delPattern: async (pattern) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },
};

export default redisClient;

