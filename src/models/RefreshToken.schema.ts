import { v4 as ObjectId } from 'uuid'
interface RefreshTokenType {
  _id?: string
  refresh_token: string
  user_id: string
}

export default class RefreshToken {
  _id?: string
  refresh_token: string
  user_id: string
  constructor({ refresh_token, user_id }: RefreshTokenType) {
    this._id = ObjectId()
    this.refresh_token = refresh_token
    this.user_id = user_id
  }
}
