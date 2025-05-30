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
      console.log('You successfully connected to Redis!')
    } catch (error) {
      throw error
    }
  }

  async saveOTP({ email }: OTPReqBody) {
    const otp = generateOTP()
    await client.set(`${otp}:${email}`, otp, { EX: Number(process.env.REDIS_OTP_TOKEN_TTL) })
    return otp
  }

  async verifyOTP(email: string, otp: string) {
    const key = `${otp}:${email}`

    // Kiểm tra OTP có tồn tại và đúng không
    const storedOTP = await client.get(key)

    if (!storedOTP) {
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
}

const redisUtils = new RedisUtils()
export default redisUtils
