// file này dùng để định nghĩa lại các thư viện nếu cần
import { Request } from 'express'
import { TokenGoogleVerifyPayload, TokenPayLoad } from './models/requests/users.requests'
declare module 'express' {
  interface Request {
    decode_authorization?: TokenPayLoad
    decode_refresh_token?: TokenPayLoad
    decode_google_verify_token?: TokenGoogleVerifyPayload
    decode_forgot_password_token?: TokenPayLoad
  }
}
