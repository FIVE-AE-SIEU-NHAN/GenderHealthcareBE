import {
  CreateUserReqBody,
  GetUserReqQuery,
  LoginReqBody,
  RegisterReqBody,
  UpdateProfileReqBody
} from '~/models/requests/users.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import dotenv from 'dotenv'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import emailServices from './email.services'
import UserRepository from '~/repositories/user.respository'
import { v4 as ObjectId } from 'uuid'
import refreshTokenServices from './refreshToken.services'
import redisUtils from '~/utils/redis'
import ConsultantProfileRepository from '~/repositories/consultant_profile.repository'
import { Topic } from '@prisma/client'
dotenv.config()

class UsersServices {
  private userRepository: UserRepository
  private consultantRepository: ConsultantProfileRepository

  constructor() {
    this.userRepository = new UserRepository()
    this.consultantRepository = new ConsultantProfileRepository()
  }

  // chữ ký access token và refresh token
  private signAccessToken(user_id: string, role: USER_ROLE) {
    return signToken({
      payload: { user_id, role, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN) }
    })
  }

  private signRefreshToken(user_id: string, role: USER_ROLE) {
    return signToken({
      payload: { user_id, role, token_type: TokenType.RefreshToken },
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
    const user = await this.userRepository.createUser({
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
      this.signAccessToken(user_id.toString(), USER_ROLE.User),
      this.signRefreshToken(user_id.toString(), USER_ROLE.User)
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
      this.signAccessToken(user_id, user!.role as USER_ROLE),
      this.signRefreshToken(user_id, user!.role as USER_ROLE)
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

    if (user.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.USER_IS_BANNED
      })
    }

    // CASE 2: Tìm thấy tài khoản với email này và chưa có Google ID
    if (!user.google_id) {
      // Cập nhật Google ID vào tài khoản hiện có
      await this.userRepository.updateGoogleId(email, google_id)

      // Tạo token để đăng nhập
      const [access_token, refresh_token] = await Promise.all([
        this.signAccessToken(user.id, user.role as USER_ROLE),
        this.signRefreshToken(user.id, user.role as USER_ROLE)
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
        this.signAccessToken(user.id, user.role as USER_ROLE),
        this.signRefreshToken(user.id, user.role as USER_ROLE)
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

    if (user.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.USER_IS_BANNED
      })
    }

    // nếu có user thì tạo access_token và refresh_token
    const user_id = user.id!
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id, user.role as USER_ROLE),
      this.signRefreshToken(user_id, user.role as USER_ROLE)
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

  async getUsersForAdmin(payload: GetUserReqQuery) {
    const {
      _page,
      _limit,
      _sort,
      _order,
      _verify,
      _role,
      _name_like,
      _email_like,
      _phone_number_like,
      _date_of_birth,
      _all
    } = payload
    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit
    const verify = _verify ? parseInt(_verify) : undefined
    const role = _role ? parseInt(_role) : undefined

    const users = await this.userRepository.getUsersForAdmin({
      limit,
      _sort,
      _order,
      verify,
      role,
      _name_like,
      _email_like,
      _phone_number_like,
      _date_of_birth,
      _skip,
      _all
    })

    const total = await this.userRepository.countUsersForAdmin({
      verify,
      role,
      _name_like,
      _email_like,
      _phone_number_like,
      _date_of_birth,
      _all
    })

    return {
      users,
      total
    }
  }

  async editStatusUser(id: string, status: number) {
    const user = await this.userRepository.getUserStatus(id)
    if (user?.verify === status) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_ALREADY_IN_THIS_STATUS
      })
    }
    return this.userRepository.updateStatusUser(id, status)
  }

  async createUser(payload: CreateUserReqBody) {
    const user_id = ObjectId()
    await this.userRepository.createUserByAdmin({
      id: user_id,
      name: payload.name,
      email: payload.email,
      date_of_birth: payload.date_of_birth ? new Date(payload.date_of_birth) : new Date(),
      gender: payload.gender,
      password: payload.password ? await hashPassword(payload.password) : '',
      phone_number: payload.phone_number,
      created_at: new Date(),
      updated_at: new Date(),
      verify: UserVerifyStatus.Verified,
      role: payload.role
    })

    if (payload.role === USER_ROLE.Consultant) {
      const id = ObjectId()
      const { specialization_1, specialization_2, certifications, experienceYears } = payload
      await this.consultantRepository.createConsultantProfile({
        id,
        user_id,
        specialization_1: specialization_1 as Topic,
        specialization_2: specialization_2 as Topic,
        certifications: certifications as string,
        experienceYears: experienceYears as number
      })
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
