import databaseServices from './database.services'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/users.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import dotenv from 'dotenv'
import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import User from '~/models/User.schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import RefreshToken from '~/models/RefreshToken.schema'
import emailServices from './email.services'
import { result } from 'lodash'
dotenv.config()

class UsersServices {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: '15m' }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: '100d' }
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const result = await databaseServices.users.insertOne(
      new User({
        _id: user_id,
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    // dùng email lên database tìm user sỡ hữu email đó
    const user = await databaseServices.users.findOne({ email })
    return user && !user.password ? true : false
  }

  async checkGoogleIdExist(email: string, google_id: string) {
    // dùng google_id lên database tìm user sỡ hữu google_id đó
    const user = await databaseServices.users.findOne({ email })

    if (!user) {
      return {
        haveAccount: false
      }
    }

    // nếu có user thì kiểm tra google_id
    // nếu có google_id thì trả về true
    if (user.google_id === google_id) {
      const user_id = user._id.toString()
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(user_id),
        this.signRefreshToken(user_id)
      ])
      return {
        haveAccount: true,
        access_token,
        refresh_token
      }
    } else {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.GOOGLE_ID_IS_INCORRECT
      })
    }
  }

  async login({ email, password }: LoginReqBody) {
    // dùng email và password để tìm user
    const user = await databaseServices.users.findOne({
      email,
      password: hashPassword(password)
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    // nếu có user thì tạo at và rf
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async checkRefreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const refreshToken = await databaseServices.refreshTokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, //401
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return refreshToken
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
