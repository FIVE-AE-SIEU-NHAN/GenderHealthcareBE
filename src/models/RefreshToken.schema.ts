import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId //khi tạo cũng k cần
  token: string
  created_at?: Date // k có cũng đc, khi tạo object thì ta sẽ new Date() sau
  user_id: ObjectId
}

export default class RefreshToken {
  _id?: ObjectId //khi client gửi lên thì không cần truyền _id
  token: string
  created_at: Date
  user_id: ObjectId
  constructor({ _id, token, created_at, user_id }: RefreshTokenType) {
    this._id = _id || new ObjectId()
    this.token = token
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}
