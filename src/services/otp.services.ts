import { OTPReqBody } from '~/models/requests/otp.request'
import { generateOTP } from '~/utils/generateCodeEmail'
import redis from './redis.services'
import redisService from './redis.services'

class OtpServices {
  async saveOTP({ email }: OTPReqBody) {
    const otp = generateOTP()
    await redisService.set(`${otp}:${email}`, otp)
    return otp
  }

  async verifyOTP(email: string, otp: string) {
    const key = `${otp}:${email}`
    const exists = await redisService.exists(key)
    if (exists) {
      await redisService.del(key)
      return true
    }
    return false
  }
}
const otpServices = new OtpServices()
export default otpServices
