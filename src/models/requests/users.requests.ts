import { JwtPayload } from 'jsonwebtoken'
import { TokenType, USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import { ParsedQs } from 'qs'
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
  gender: string
  phone_number: string
  email_verify_token: string
  google_id?: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LoginGoogleReqBody {
  id_token: string
}

export interface TokenPayLoad extends JwtPayload {
  user_id: string
  role: USER_ROLE
  token_type: TokenType
}
export interface TokenGoogleVerifyPayload {
  email: string
  email_verified: boolean
  name: string
  picture?: string
  locale?: string
  family_name?: string
  given_name?: string
  sub: string
}

export interface LogOutReqBody {
  refresh_token: string
}

export interface VerifyEmailReqQuery extends ParsedQs {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordTokenReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBogy {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface OTPReqBody {
  email: string
}
export interface ForgotPasswordReqBody {
  email: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface UpdateProfileReqBody {
  name?: string
  date_of_birth?: string
  gender?: string
  phone_number?: string
}

export interface GetUserReqQuery extends ParsedQs {
  _page: string
  _limit: string
  _sort?: string
  _order?: string
  _verify?: string
  _role?: string
  _name_like?: string
  _email_like?: string
  _phone_number_like?: string
  _date_of_birth?: string
  _all?: string
}

export interface EditStatusUserReqBody {
  status: number
}

export interface EditReqQuery extends ParsedQs {
  id: string
}
