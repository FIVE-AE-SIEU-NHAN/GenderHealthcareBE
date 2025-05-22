import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'

interface UserType {
  _id?: ObjectId //optional là ?
  name?: string
  email: string
  date_of_birth?: Date
  gender?: string
  password: string
  created_at?: Date
  updated_at?: Date //lúc mới tạo chưa có gì thì nên cho bằng create_at
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  google_id?: string // nếu là tài khoản google thì sẽ có id này
  verify?: UserVerifyStatus
  role?: USER_ROLE //đây là dạng Enum
}

export default class User {
  _id?: ObjectId
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
    this._id = user._id || new ObjectId() // tự tạo id
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
