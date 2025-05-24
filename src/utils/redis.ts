import { createClient } from 'redis'

const client = createClient({
  username: 'default',
  password: 'DBQcCiwTFq1jkHkUj7IFxaGYVjczZe3f',
  socket: {
    host: 'redis-16859.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    port: 16859
  }
})

client.on('error', (err) => console.log('Redis Client Error', err))

class RedisUtils {
  async connect() {
    try {
      await client.connect()
      console.log('You successfully connected to Redis!')
    } catch (error) {
      throw error
    }
  }

  async get(key: string) {
    try {
      const value = await client.get(key)
      return value
    } catch (error) {
      throw error
    }
  }

  async set(key: string, value: string) {
    try {
      return await client.set(key, value, { EX: 120 })
    } catch (error) {
      throw error
    }
  }

  async del(key: string) {
    try {
      return await client.del(key)
    } catch (error) {
      throw error
    }
  }

  async exists(key: string) {
    try {
      const result = await client.exists(key)
      return result
    } catch (error) {
      throw error
    }
  }
}

const redisUtils = new RedisUtils()
export default redisUtils
