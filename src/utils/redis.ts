import { createClient } from 'redis'
import { generateOTP } from './nanoid'
import { OTPReqBody } from '~/models/requests/users.requests'

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
      console.log('You successfully connected to \x1b[36mRedis!\x1b[0m')
    } catch (error) {
      throw error
    }
  }

  async saveOTP({ email }: OTPReqBody) {
    const otp = generateOTP()
    await client.set(`otp:${email}`, otp, { EX: Number(process.env.REDIS_OTP_TOKEN_TTL) })
    return otp
  }

  async verifyOTP(email: string, otp: string) {
    const key = `otp:${email}`

    // Kiểm tra OTP có tồn tại và đúng không
    const storedOTP = await client.get(key)
    if (!storedOTP || storedOTP !== otp) {
      return false
    }

    // OTP hợp lệ - xóa OTP sau khi đã sử dụng thành công
    await client.del(key)
    return true
  }

  async saveForgotPasswordToken(user_id: string, token: string) {
    const key = `forgot_password:${user_id}`
    await client.set(key, token, { EX: Number(process.env.REDIS_FORGOT_PASSWORD_TOKEN_TTL) })
  }

  async verifyForgotPasswordToken(user_id: string, token: string) {
    const key = `forgot_password:${user_id}`
    const storedToken = await client.get(key)

    if (!storedToken || storedToken !== token) {
      return false
    }

    // Token hợp lệ - xóa token sau khi đã sử dụng thành công
    await client.del(key)
    return true
  }

  async getIndexNextConsultant(topic: string, numberOfConsultants: number) {
    const redisKey = `consultant_answer_index:${topic}`

    // mỗi ngày reset index
    const ttl = await client.ttl(redisKey)
    if (ttl === -1) {
      await client.expire(redisKey, Number(process.env.REDIS_GET_NEXT_CONSULTANT_TTL))
    }
    // Tăng chỉ số index trong Redis
    const indexInRedis = await client.incr(redisKey)
    // Tính vị trí consultant
    const index = (indexInRedis - 1) % numberOfConsultants

    return index
  }

  async saveRefreshToken(user_id: string, token: string) {
    const key = `refresh_token:${user_id}`
    // Xóa token cũ nếu có
    await client.del(key)
    // Lưu token mới với TTL từ biến môi trường
    await client.set(key, token, { EX: Number(process.env.REDIS_REFRESH_TOKEN_TTL) })
  }

  async deleteRefreshToken(user_id: string) {
    const key = `refresh_token:${user_id}`
    await client.del(key)
  }

  async verifyRefreshToken(user_id: string, token: string) {
    const key = `refresh_token:${user_id}`
    const storedToken = await client.get(key)

    if (!storedToken || storedToken !== token) {
      await client.del(key)
      return false
    }

    return true
  }

  async getIndexNextConsultantForBookingAppointment(topic: string, numberOfConsultants: number) {
    const redisKey = `consultant_booking_appointment_index:${topic}`

    // mỗi ngày reset index
    const ttl = await client.ttl(redisKey)
    if (ttl === -1) {
      await client.expire(redisKey, Number(process.env.REDIS_GET_NEXT_CONSULTANT_TTL))
    }
    // Tăng chỉ số index trong Redis
    const indexInRedis = await client.incr(redisKey) // 1
    // Tính vị trí consultant
    const index = (indexInRedis - 1) % numberOfConsultants

    return index
  }

  async setNextConsultantIndex(topic: string, index: number) {
    const redisKey = `consultant_booking_appointment_index:${topic}`
    // Lưu index mới với TTL từ biến môi trường
    await client.set(redisKey, index, { EX: Number(process.env.REDIS_GET_NEXT_CONSULTANT_TTL) })
  }

  async addOnlineUser(user_id: string, socket_id: string) {
    const key = `online:${user_id}`
    await client.sAdd(key, socket_id)
  }

  async removeOnlineSocket(user_id: string, socket_id: string) {
    const key = `online:${user_id}`
    await client.sRem(key, socket_id)
    const remaining = await client.sCard(key)
    if (remaining === 0) {
      await client.del(key)
    }
  }

  async isUserOnline(user_id: string) {
    const key = `online:${user_id}`
    const onlineSockets = await client.sCard(key)
    return onlineSockets > 0
  }
}

const redisUtils = new RedisUtils()
export default redisUtils
