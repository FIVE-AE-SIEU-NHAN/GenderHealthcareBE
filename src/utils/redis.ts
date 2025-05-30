// RedisUtils.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

class RedisUtils {
  async connect() {
    try {
      if (!client.isOpen) {
        await client.connect();
        console.log('✅ Connected to Redis');
      }
    } catch (error) {
      console.error('❌ Redis connection error:', error);
      throw error;
    }
  }

  async get(key: string) {
    try {
      return await client.get(key);
    } catch (error) {
      console.error('❌ Redis GET error:', error);
      throw error;
    }
  }

  async set(key: string, value: string) {
    try {
      const ttl = parseInt(process.env.TOKEN_TTL || '120', 10);
      return await client.set(key, value, { EX: ttl });
    } catch (error) {
      console.error('❌ Redis SET error:', error);
      throw error;
    }
  }

  async del(key: string) {
    try {
      return await client.del(key);
    } catch (error) {
      console.error('❌ Redis DEL error:', error);
      throw error;
    }
  }

  async exists(key: string) {
    try {
      return await client.exists(key);
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error);
      throw error;
    }
  }
}

const redisUtils = new RedisUtils();
export default redisUtils;
