//trong users.routers.ts
//khai báo
import express from 'express'
import {
  loginController,
  registerController
  // loginGoogleController,
  // logoutController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginGoogleValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middlewares'
import { verifyGoogleToken } from '~/utils/google'
import { wrapAsync } from '~/utils/handler'

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
 * Description: Login user
 * Path: /user/login
 * Method: POST
 * Body: { email: string, password: string}
 */
userRouter.post('/login', loginValidator, wrapAsync(loginController))

// /**
//  * Description: Login with Google
//  * Path: /user/login-google
//  * Method: POST
//  * Body: { id_token: string }
//  */
// userRouter.post('/login-google', loginGoogleValidator, wrapAsync(loginGoogleController))

// /**
//  * Description: Logout
//  * Path: /user/logout
//  * Method: POST
//  * Header: {Authorization: Bearer <access_token>}
//  * Body: {refresh_token: string}
//  */
// userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

// /**
//  * Description: Send email with token
//  * Path: /otp//get-token
//  * Method: POST
//  * Request body: { email: string }
//  */
// userRouter.post('/google-authen', async (req, res) => {
//   const { token } = req.body
//   const payload = await verifyGoogleToken(token)
//   res.status(200).json({
//     message: {
//       payload
//     }
//   })
// })

export default userRouter
