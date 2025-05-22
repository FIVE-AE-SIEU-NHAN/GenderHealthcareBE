import express from 'express'
import { result } from 'lodash'
import { getOTPController } from '~/controllers/otp.controllers'
import { getOTPValidator } from '~/middlewares/otp.middlewares'
import { wrapAsync } from '~/utils/handler'

const otpRouter = express.Router()

/**
 * Description: Send email with token
 * Path: /otp//get-token
 * Method: POST
 * Request body: { email: string }
 */
otpRouter.post('/get-token', getOTPValidator, wrapAsync(getOTPController))

export default otpRouter
