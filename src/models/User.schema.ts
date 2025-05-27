import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import { v4 as ObjectId } from 'uuid'

interface UserType {
  _id?: string
  name?: string
  email: string
  date_of_birth?: Date
  gender?: string
  password?: string
  created_at?: Date
  updated_at?: Date
  forgot_password_token?: string
  google_id?: string
  verify?: UserVerifyStatus

  role?: USER_ROLE
}

export default class User {
  _id?: string
  name: string
  email: string
  date_of_birth: Date
  gender: string
  password: string
  created_at: Date
  updated_at: Date
  forgot_password_token: string
  google_id: string
  verify: UserVerifyStatus

  role: USER_ROLE
  constructor(user: UserType) {
    const date = new Date() //tạo này cho ngày created_at updated_at bằng nhau
    this._id = user._id || ObjectId() // tự tạo id
    this.name = user.name || '' // nếu người dùng tạo mà k truyền ta sẽ để rỗng
    this.email = user.email
    this.date_of_birth = user.date_of_birth || new Date()
    this.gender = user.gender || 'lgbt'
    this.password = user.password || ''
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.forgot_password_token = user.forgot_password_token || ''
    this.google_id = user.google_id || ''
    this.verify = user.verify || UserVerifyStatus.Unverified

    this.role = user.role || USER_ROLE.User
  }
}
