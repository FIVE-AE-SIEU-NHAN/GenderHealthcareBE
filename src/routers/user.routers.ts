//trong users.routers.ts
//khai báo
import express from 'express'
import test from 'node:test'
import {
  getOTPController,
  loginController,
  registerController,
  loginGoogleController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  refreshTokenController,
  getProfileController,
  updateProfileController
} from '~/controllers/users.controllers'
import { filterMiddlewares } from '~/middlewares/filter.middlewares'
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
  resetPasswordValidator,
  updateProfileValidator
} from '~/middlewares/user.middlewares'
import { UpdateProfileReqBody } from '~/models/requests/users.requests'
import User from '~/models/User.schema'
import RefreshTokenRepository from '~/repositories/refresh_token.repository'
import UserRepository from '~/repositories/user.respository'
import { verifyGoogleToken } from '~/utils/google'
import { wrapAsync } from '~/utils/handler'
import { verifyToken } from '~/utils/jwt'

const userRouter = express.Router()

/**
 * Description: Send email with token
 * Path: /otp/get-otp
 * Method: POST
 * Request body: { email: string }
 */
userRouter.post('/get-otp', getOTPValidator, wrapAsync(getOTPController))

/**
 * Description: Register user
 * Path: /user/register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirmPassword: string, dob: string }
 */
userRouter.post('/register', registerValidator, wrapAsync(registerController))

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
userRouter.put('/change-password', accessTokenValidator, changePasswordValidator, wrapAsync(changePasswordController))

/**
 * Description: Verify Google token
 * Path: /user/refresh-token
 * Method: POST
 * Body: { refresh_token: string }
 */
userRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

/**
 * Description: get user profile
 * Path: /user/profile
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 */
userRouter.post('/profile' /*, accessTokenValidator*/, wrapAsync(getProfileController))

/**
 * Description: Update user profile
 * Path: /user/profile
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * Body: {
 *         name?: string,
 *         date_of_birth?: string,
 *         gender?: string,
 *         phone_number?: string
 *       }
 */
userRouter.patch(
  '/profile',
  filterMiddlewares<UpdateProfileReqBody>(['name', 'date_of_birth', 'gender', 'phone_number']),
  accessTokenValidator,
  updateProfileValidator,
  wrapAsync(updateProfileController)
)

// phân quyền api cho phép truy cập
// tao router + middleware moi cho logout kh quan tam access token vaf refresh token het han

export default userRouter
