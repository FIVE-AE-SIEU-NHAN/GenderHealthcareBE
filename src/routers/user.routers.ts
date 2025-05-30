//trong users.routers.ts
//khai báo
import express from 'express'
import {
  getOTPController,
  loginController,
  registerController,
  loginGoogleController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  getOTPValidator,
  loginGoogleValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator
} from '~/middlewares/user.middlewares'
import { verifyGoogleToken } from '~/utils/google'
import { wrapAsync } from '~/utils/handler'
import { verifyToken } from '~/utils/jwt'

//tạo router
const userRouter = express.Router()

/**
 * Description: Register user
 * Path: /user/register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirmPassword: string, dob: string }
 */
userRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
 * Description: Send email with token
 * Path: /otp/get-otp
 * Method: POST
 * Request body: { email: string }
 */
userRouter.post('/get-otp', getOTPValidator, wrapAsync(getOTPController))

/**
 * Description: Login user
 * Path: /user/login
 * Method: POST
 * Body: { email: string, password: string}
 */
userRouter.post('/login', loginValidator, wrapAsync(loginController))

/**
 * Description: Login with Google
 * Path: /user/login-google
 * Method: POST
 * Body: { id_token: string }
 */
userRouter.post('/login-google', loginGoogleValidator, wrapAsync(loginGoogleController))

/**
 * Description: Logout
 * Path: /user/logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/**
 * Description: Forgot password
 * Path: /user/forgot-password
 * Method: POST
 * Body: { email: string }
 */
userRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/**
 * Description: Reset password
 * Path: /user/reset-password
 * Method: POST
 * Body: { token: string, newPassword: string, confirmNewPassword: string }
 */
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  forgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)
/**
 * Description: Change password
 * Path: /user/change-password
 * Method: PUT
 * Header: {Authorization: Bearer <access_token>}
 * Body: { oldPassword: string, newPassword: string, confirmNewPassword: string }
 */

userRouter.put(
  '/change-password',
  /*accessTokenValidator, */ changePasswordValidator,
  wrapAsync(changePasswordController)
)

// route tao access token moi
// phân quyền api cho phép truy cập
// tao router + middleware moi cho logout kh quan tam access token vaf refresh token het han

export default userRouter
