//trong users.routers.ts
//khai báo
import express from 'express'
import { wrap } from 'lodash'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'
import { validate } from '~/utils/validation'

//tạo router
const userRouter = express.Router()

/*
    desc: login
    path: users/login
    method: post
    body: {
        email: string,
        password: string
    }
*/
userRouter.post('/login', loginValidator, wrapAsync(loginController))

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
 * Description: Lougout
 * Path: /user/logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 */
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

export default userRouter
