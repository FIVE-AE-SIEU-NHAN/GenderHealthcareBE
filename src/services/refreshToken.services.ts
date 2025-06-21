import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, USER_ROLE } from '~/constants/enums'
import redisUtils from '~/utils/redis'

class RefreshTokenServices {
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

  async refreshToken(user_id: string, refresh_token: string) {
    const result = await redisUtils.verifyRefreshToken(user_id, refresh_token)

    const decode_authorization = await verifyToken({
      token: refresh_token,
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })

    if (!result) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, // 401
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }

    // nếu hợp lệ thì tạo access token mới
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id, decode_authorization.role),
      this.signRefreshToken(user_id, decode_authorization.role)
    ])

    await redisUtils.saveRefreshToken(user_id.toString(), new_refresh_token)

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
}

const refreshTokenServices = new RefreshTokenServices()
export default refreshTokenServices
