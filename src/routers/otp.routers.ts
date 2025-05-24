import express from 'express'
import { result } from 'lodash'
import { getOTPController } from '~/controllers/otp.controllers'
import { getOTPValidator } from '~/middlewares/otp.middlewares'
import otpServices from '~/services/otp.services'
import { wrapAsync } from '~/utils/handler'
import { verifyToken } from '~/utils/jwt'

const otpRouter = express.Router()

/**
 * Description: Send email with token
 * Path: /otp//get-token
 * Method: POST
 * Request body: { email: string }
 */
otpRouter.post('/get-token', getOTPValidator, wrapAsync(getOTPController))

otpRouter.post('/verify-token', (req, res) => {
  const { email, otp } = req.body
  otpServices.verifyOTP(email, otp).then((result) => {
    if (result) {
      res.status(200).json({ message: 'Token is valid' })
    } else {
      res.status(400).json({ message: 'Token is invalid' })
    }
  })
})

export default otpRouter
