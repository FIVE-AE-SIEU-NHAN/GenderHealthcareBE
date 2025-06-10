import { v4 as ObjectId } from 'uuid'
import RefreshToken from '~/models/RefreshToken.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import RefreshTokenRepository from '~/repositories/refresh_token.repository'
import usersServices from './users.services'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

class RefreshTokenServices {
  private refreshTokenRepository: RefreshTokenRepository

  constructor() {
    this.refreshTokenRepository = new RefreshTokenRepository()
  }

  // chữ ký access token và refresh token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN) }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN) }
    })
  }

  async createRefreshToken(user_id: string, refresh_token: string) {
    await this.refreshTokenRepository.createRefreshToken(user_id, refresh_token)
  }

  async checkRefreshTokenExist(refresh_token: string) {
    const refreshToken = await this.refreshTokenRepository.findToken(refresh_token)
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, //401
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return refreshToken
  }

  async deleteRefreshToken(refresh_token: string) {
    const rs = await this.refreshTokenRepository.deleteToken(refresh_token)
  }

  async checkRefreshToken(user_id: string, refresh_token: string) {
    const result = await this.refreshTokenRepository.findRefreshTokenByUserId(user_id, refresh_token)
    if (!result) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return result
  }

  async refreshToken(user_id: string, refresh_token: string) {
    await this.deleteRefreshToken(refresh_token)

    // nếu hợp lệ thì tạo access token mới
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    await this.createRefreshToken(user_id, new_refresh_token)

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
}

const refreshTokenServices = new RefreshTokenServices()
export default refreshTokenServices
