import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
export default class RefreshTokenRepository {
  private model = prisma.refresh_tokens

  async createRefreshToken(user_id: string, refresh_token: string) {
    const id = ObjectId()
    return (this.model as any).create({
      data: {
        id,
        user_id,
        refresh_token
      }
    })
  }

  async findToken(refresh_token: string) {
    return (this.model as any).findFirst({
      where: { refresh_token }
    })
  }

  async deleteToken(refresh_token: string) {
    return (this.model as any).delete({
      where: { refresh_token }
    })
  }

  async findRefreshTokenByUserId(user_id: string, refresh_token: string) {
    const result = await (this.model as any).findFirst({
      where: {
        user_id,
        refresh_token
      }
    })
    return result?.refresh_token || null
  }
}
