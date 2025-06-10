//users.controllers.ts
import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  ChangePasswordReqBody,
  ForgotPasswordReqBody,
  LoginGoogleReqBody,
  LoginReqBody,
  LogOutReqBody,
  OTPReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayLoad,
  UpdateProfileReqBody,
  VerifyEmailReqQuery
} from '~/models/requests/users.requests'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserVerifyStatus } from '~/constants/enums'
import { verifyGoogleToken } from '~/utils/google'
import emailServices from '~/services/email.services'
import redisUtils from '~/utils/redis'
import refreshTokenServices from '~/services/refreshToken.services'
import { omit } from 'lodash'

export const getOTPController = async (
  req: Request<ParamsDictionary, any, OTPReqBody>,
  res: Response,
  next: NextFunction
) => {
  const otp = await redisUtils.saveOTP(req.body)

  await emailServices.sendVerificationEmail(req.body.email, otp)

  res.status(200).json({
    message: USERS_MESSAGES.SEND_MAIL_SUCCESS
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const checkResult = await usersServices.checkEmailExist(req.body.email)

  // Nếu chưa có tài khoản → đăng ký mới
  if (!checkResult || !checkResult.haveAccount) {
    const result = await usersServices.register(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      result
    })
    return
  }

  const { havePassword } = checkResult

  // Nếu có tài khoản nhưng chưa có password → update password
  if (!havePassword) {
    const result = await usersServices.updateUserByEmail(req.body.email, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      result
    })
    return
  }

  // Nếu đã có tài khoản và đã có password → báo lỗi
  throw new ErrorWithStatus({
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  // kiểm tra email và password có hợp lệ hay không
  const result = await usersServices.login({ email, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const loginGoogleController = async (
  req: Request<ParamsDictionary, any, LoginGoogleReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, name, sub: google_id } = req.decode_google_verify_token!

  // Gọi service xử lý login bằng Google
  const { haveAccount, googleIDIsValid, access_token, refresh_token } = await usersServices.loginWithGoogleId(
    email,
    google_id
  )

  // Trường hợp: tài khoản chưa tồn tại → đăng ký mới
  if (!haveAccount) {
    const result = await usersServices.register({
      name,
      email,
      google_id,
      password: '',
      confirm_password: '',
      date_of_birth: '',
      gender: '',
      phone_number: '',
      email_verify_token: ''
    })

    res.status(HTTP_STATUS.CREATED).json({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      result
    })
    return
  }

  // Trường hợp: tài khoản đã tồn tại và google_id đúng
  if (googleIDIsValid) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      access_token: access_token,
      refresh_token: refresh_token
    })
    return
  }

  // Trường hợp: tài khoản có nhưng google_id không đúng
  throw new ErrorWithStatus({
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message: USERS_MESSAGES.GOOGLE_ID_IS_INCORRECT
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogOutReqBody>,
  res: Response,
  next: NextFunction
) => {
  console.log('144.users.controllers.ts', req.decode_authorization, req.decode_refresh_token)
  const { refresh_token } = req.body

  const { user_id: user_id_at } = req.decode_authorization as TokenPayLoad
  const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayLoad

  console.log('user_id_at', user_id_at)
  console.log('user_id_rf', user_id_rf)
  // kiểm tra access token và refresh token có cùng user_id hay không
  if (user_id_at != user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED, // 401
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }
  // kiểm tra refresh token có tồn tại trong db hay không
  await refreshTokenServices.checkRefreshTokenExist(refresh_token)
  // nếu có thì xóa refresh token trong db
  await usersServices.logout(refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { email } = req.body
  const { havePassword } = await usersServices.checkEmailExist(email)
  if (!havePassword) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  } else {
    await usersServices.forgotPassword(email)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    })
  }
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body
  const { user_id } = req.decode_forgot_password_token as TokenPayLoad
  // cập nhật mật khẩu mới cho user
  await usersServices.resetPassword(user_id, password)
  res.status(HTTP_STATUS.OK).json({
    mesage: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  const { old_password, password } = req.body

  await usersServices.changePassword({ user_id, old_password, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response, //
  next: NextFunction
) => {
  const { user_id } = req.decode_refresh_token as TokenPayLoad
  const { refresh_token } = req.body
  await refreshTokenServices.checkRefreshToken(user_id, refresh_token)

  const result = await refreshTokenServices.refreshToken(user_id, refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  // const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1c1d0365-1d64-43d3-894f-d3f69949ebbc'
  const user = await usersServices.getProfile(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    user: omit(user, ['password'])
  })
}

export const updateProfileController = async (
  req: Request<ParamsDictionary, any, UpdateProfileReqBody>,
  res: Response, //
  next: NextFunction
) => {
  // const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1c1d0365-1d64-43d3-894f-d3f69949ebbc'
  const payload = req.body
  const userInfor = await usersServices.updateProfile(user_id, payload)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    userInfor
  })
}
