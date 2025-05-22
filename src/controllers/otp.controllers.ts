import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { USERS_MESSAGES } from '~/constants/messages'
import { OTPReqBody } from '~/models/requests/otp.request'
import emailServices from '~/services/email.services'
import otpServices from '~/services/otp.services'
import { generateOTP } from '~/utils/generateCodeEmail'

export const getOTPController = async (
  req: Request<ParamsDictionary, any, OTPReqBody>,
  res: Response,
  next: NextFunction
) => {
  const otp = await otpServices.saveOTP(req.body)

  await emailServices.sendVerificationEmail(req.body.email, otp)

  res.status(200).json({
    message: USERS_MESSAGES.SEND_MAIL_SUCCESS
  })
}
