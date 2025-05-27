import nodemailer from 'nodemailer'
import { SendMailOptions } from 'nodemailer'
import dotenv from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
dotenv.config()

class EmailServices {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  async sendVerificationEmail(email: string, token: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: '[ Gender4Care ] Verify your email address',
        text: 'Please verify your email by clicking the link below:',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
            <div style="background-color: #1977cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="margin: 0;">Xác Thực Địa Chỉ Email</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h2>Xin chào!</h2>
              <br>Để hoàn thành yêu cầu của bạn với trang <span style="font-weight: bold; color: #1977cc;"> Đăng kí tài khoản Gender4Care </span>, <br> vui lòng nhập mã gồm 6 chữ và số trên trang xác minh Email:</p>
              <div style="text-align: center;">
                <div " 
                   style="background-color: #1977cc;
                          color: white !important;
                          padding: 15px 30px;
                          text-decoration: none;
                          border-radius: 5px;
                          display: inline-block;
                          margin: 20px 0;
                          font-weight: bold;">
                  ${token}
                </div>
              </div>
              <p>LƯU Ý KHÔNG CHIA SẺ MÃ VỚI BẤT KỲ AI.</p>
              <p>Mã xác thực sẽ hết hạn sau 2 phút vì lý do bảo mật.</p>
              <p>Trân trọng,<br>Gender Healthcare Team</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>Đây là email tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `
      })
      return info
    } catch (error) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND, //404
        message: USERS_MESSAGES.SEND_MAIL_FAIL
      })
    }
  }
}

const emailServices = new EmailServices()
export default emailServices
