import { OTPReqBody } from '~/models/requests/otp.request'
import { generateOTP } from '~/utils/nanoid'
import redisService from '~/utils/redis'

class OtpServices {
  async saveOTP({ email }: OTPReqBody) {
    const otp = generateOTP()
    await redisService.set(`${otp}:${email}`, otp)
    return otp
  }

  async verifyOTP(email: string, otp: string) {
    const key = `${otp}:${email}`

    // Kiểm tra xem OTP có hết hạn không
    const isExpired = await redisService.get(`otp:${email}:expired`)
    if (isExpired) {
      return {
        valid: false,
        status: 'expired'
      }
    }

    // Kiểm tra OTP có tồn tại và đúng không
    const storedOTP = await redisService.get(key)
    if (!storedOTP) {
      return {
        valid: false,
        status: 'invalid'
      }
    }

    // OTP hợp lệ - xóa OTP sau khi đã sử dụng thành công
    await redisService.del(key)
    return {
      valid: true,
      status: 'valid'
    }
  }
}
const otpServices = new OtpServices()
export default otpServices
