import nodemailer from 'nodemailer'
import { SendMailOptions } from 'nodemailer'
import dotenv from 'dotenv'
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

  async sendMail(email: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Test Email',
        text: 'This is a test email sent from Node.js using Nodemailer.',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #1977cc;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .button {
              background-color: #1977cc;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
              margin: 20px 0;
              transition: background-color 0.3s ease;
            }
            .button:hover {
              background-color: #1565b0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You have requested to reset your password. Click the button below to reset it:</p>
              <center>
                <a href="http://localhost:3000/reset-password/ahihi" class="button">Reset Password</a>
              </center>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>Best regards,<br>Gender Healthcare Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
        `
      })
      console.log('Email sent successfully:', info.messageId)
      return info
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}

const emailServices = new EmailServices()
export default emailServices
