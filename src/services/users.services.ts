import { LoginReqBody, RegisterReqBody, UpdateProfileReqBody } from '~/models/requests/users.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import dotenv from 'dotenv'
import User from '~/models/User.schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import RefreshToken from '~/models/RefreshToken.schema'
import emailServices from './email.services'
import { result } from 'lodash'
import UserRepository from '~/repositories/user.respository'
import { v4 as ObjectId } from 'uuid'
import refreshTokenServices from './refreshToken.services'
import redisUtils from '~/utils/redis'
dotenv.config()

class UsersServices {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  // chữ ký access token và refresh token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      // options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN) }
      options: { expiresIn: '1m' }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN) }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: Number(process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN) }
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = ObjectId()
    await this.userRepository.createUser({
      id: user_id,
      name: payload.name,
      email: payload.email,
      date_of_birth: payload.date_of_birth ? new Date(payload.date_of_birth) : new Date(),
      gender: payload.gender,
      password: payload.password ? await hashPassword(payload.password) : '',
      phone_number: payload.phone_number,
      created_at: new Date(),
      updated_at: new Date(),
      forgot_password_token: '',
      google_id: payload.google_id ?? '',
      verify: UserVerifyStatus.Verified,
      role: USER_ROLE.User
    })

    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    await refreshTokenServices.createRefreshToken(user_id, refresh_token)

    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const user = await this.userRepository.checkEmailExist(email)

    // Trường hợp không có tài khoản
    if (!user) {
      return {
        haveAccount: false,
        havePassword: false
      }
    }

    // Trường hợp có tài khoản nhưng chưa có password (chỉ có Google ID)
    if (!user.password && user.google_id) {
      return {
        haveAccount: true,
        havePassword: false
      }
    }

    // Trường hợp có tài khoản và đã có password
    return {
      haveAccount: true,
      havePassword: true
    }
  }

  async updateUserByEmail(email: string, payload: RegisterReqBody) {
    await this.userRepository.updateUserHaveGoogleId(email, {
      ...payload,
      password: hashPassword(payload.password)
    })
    const user = await this.userRepository.findUserByEmail(email)
    // Tạo token để đăng nhập
    const user_id = user!.id
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    await refreshTokenServices.createRefreshToken(user_id, refresh_token)

    return {
      access_token,
      refresh_token
    }
  }

  async loginWithGoogleId(email: string, google_id: string) {
    // Tìm user bằng email
    const user = await this.userRepository.checkEmailExist(email)

    // CASE 1: Không tìm thấy tài khoản với email này
    if (!user) {
      return {
        haveAccount: false
      }
    }

    // CASE 2: Tìm thấy tài khoản với email này và chưa có Google ID
    if (!user.google_id) {
      // Cập nhật Google ID vào tài khoản hiện có
      await this.userRepository.updateGoogleId(email, google_id)

      // Tạo token để đăng nhập
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(user.id),
        this.signRefreshToken(user.id)
      ])

      await refreshTokenServices.createRefreshToken(user.id, refresh_token)

      return {
        haveAccount: true,
        googleIDIsValid: true,
        access_token,
        refresh_token
      }
    }

    // CASE 3: Tìm thấy tài khoản với email này và đã có Google ID
    if (user.google_id === google_id) {
      // Google ID khớp với ID được lưu trong DB
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(user.id),
        this.signRefreshToken(user.id)
      ])

      await refreshTokenServices.createRefreshToken(user.id, refresh_token)

      return {
        haveAccount: true,
        googleIDIsValid: true,
        access_token,
        refresh_token
      }
    } else {
      // Google ID không khớp với ID được lưu trong DB
      return {
        haveAccount: true,
        googleIDIsValid: false
      }
    }
  }

  async login({ email, password }: LoginReqBody) {
    // dùng email và password để tìm user
    const user = await this.userRepository.checkLogin(email, password)
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    // nếu có user thì tạo access_token và refresh_token
    const user_id = user.id!
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    await refreshTokenServices.createRefreshToken(user_id, refresh_token)

    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await refreshTokenServices.deleteRefreshToken(refresh_token)
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.getUserByEmail(email)

    // lấy user_id tạo mã forgot_password_token
    const user_id = user?.id
    const forgot_password_token = await this.signForgotPasswordToken(user_id!)
    // lưu vào database

    await redisUtils.saveForgotPasswordToken(user_id!, forgot_password_token)

    // gửi mail
    await emailServices.sendForgotPasswordEmail(email, forgot_password_token)
  }

  async resetPassword(user_id: string, password: string) {
    await this.userRepository.updatePasswordById(user_id, hashPassword(password))
  }

  async changePassword({
    user_id,
    old_password,
    password
  }: {
    user_id: string
    old_password: string
    password: string
  }) {
    // kiểm tra mật khẩu cũ có đúng không
    const user = await this.userRepository.findUserById(user_id)
    if (!user || !user.password || user.password !== hashPassword(old_password)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: USERS_MESSAGES.OLD_PASSWORD_IS_INCORRECT
      })
    }

    // cập nhật mật khẩu mới
    await this.userRepository.updatePasswordById(user_id, hashPassword(password))
  }

  async getProfile(user_id: string) {
    return await this.userRepository.findUserById(user_id)
  }

  async updateProfile(user_id: string, payload: UpdateProfileReqBody) {
    const user = await this.userRepository.findUserById(user_id)
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    const userInfor = await this.userRepository.updateUserProfile(user_id, payload)

    return userInfor
  }
}

const usersServices = new UsersServices()
export default usersServices
