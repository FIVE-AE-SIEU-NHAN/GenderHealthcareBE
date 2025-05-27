import { v4 as ObjectId } from 'uuid'
import databaseService from './database.services'
import RefreshToken from '~/models/RefreshToken.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import RefreshTokenRepository from '~/repositories/refresh_token.repository'

class RefreshTokenServices {
  private refreshTokenRepository: RefreshTokenRepository

  constructor() {
    this.refreshTokenRepository = new RefreshTokenRepository()
  }

  async createRefreshToken(user_id: string, refresh_token: string) {
    await this.refreshTokenRepository.create({
      _id: ObjectId(),
      user_id,
      refresh_token
    })
  }

  async checkRefreshTokenExist(refresh_token: string) {
    console.log('25.rf.services.ts', refresh_token)
    const refreshToken = await this.refreshTokenRepository.checkRefreshTokenExist(refresh_token)
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, //401
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return refreshToken
  }

  async deleteRefreshToken(refresh_token: string) {
    await this.refreshTokenRepository.deleteToken(refresh_token)
  }
}

const refreshTokenServices = new RefreshTokenServices()
export default refreshTokenServices
