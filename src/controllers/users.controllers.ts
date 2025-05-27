//users.controllers.ts
import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  LoginGoogleReqBody,
  LoginReqBody,
  LogOutReqBody,
  RegisterReqBody,
  TokenPayLoad,
  VerifyEmailReqQuery
} from '~/models/requests/users.requests'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { Log } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { verifyGoogleToken } from '~/utils/google'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const isDup = await usersServices.checkEmailExist(req.body.email)

  // Nếu email tồn tại và kho
  if (isDup) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }

  // nếu chưa thì tiến hành đăng ký
  const result = await usersServices.register(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  // kiểm tra email và password có hợp lệ hay không
  await usersServices.login({ email, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS
  })
}

// export const loginGoogleController = async (
//   req: Request<ParamsDictionary, any, LoginGoogleReqBody>,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email, name, sub: google_id } = req.decode_google_verify_token!

//   // kiểm tra email có tồn tại trong db hay không
//   const { haveAccount, access_token, refresh_token } = await usersServices.checkGoogleIdExist(email, google_id)

//   // Nếu email không tồn tại, tạo tài khoản mới
//   if (!haveAccount) {
//     const result = await usersServices.register({
//       email,
//       name,
//       google_id,
//       password: '',
//       date_of_birth: new Date().toISOString(),
//       confirm_password: '',
//       gender: '',
//       phone_number: '',
//       email_verify_token: ''
//     })
//     res.status(HTTP_STATUS.CREATED).json({
//       message: USERS_MESSAGES.LOGIN_SUCCESS,
//       result
//     })

//     return
//   }

//   // Nếu email đã tồn tại, đăng nhập
//   res.status(HTTP_STATUS.OK).json({
//     message: USERS_MESSAGES.LOGIN_SUCCESS,
//     access_token,
//     refresh_token
//   })
// }

// export const logoutController = async (
//   req: Request<ParamsDictionary, any, LogOutReqBody>,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { refresh_token } = req.body

//   const { user_id: user_id_at } = req.decode_authorization as TokenPayLoad
//   const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayLoad
//   // kiểm tra access token và refresh token có cùng user_id hay không
//   if (user_id_at != user_id_rf) {
//     throw new ErrorWithStatus({
//       status: HTTP_STATUS.UNAUTHORIZED, // 401
//       message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
//     })
//   }
//   // kiểm tra refresh token có tồn tại trong db hay không
//   await usersServices.checkRefreshToken({
//     user_id: user_id_at,
//     refresh_token
//   })
//   // nếu có thì xóa refresh token trong db
//   await usersServices.logout(refresh_token)
//   res.status(HTTP_STATUS.OK).json({
//     message: USERS_MESSAGES.LOGOUT_SUCCESS
//   })
// }
