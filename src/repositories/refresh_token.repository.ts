import RefreshToken from '~/models/RefreshToken.schema'
import BaseRepository from './base.repository'
import databaseService from '~/services/database.services'

export default class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super('Refresh_tokens') // table name dưới db
  }

  async checkRefreshTokenExist(refresh_token: string): Promise<RefreshToken> {
    const results = (await databaseService.query(`SELECT * FROM ${this.tableName} WHERE refresh_token = ?`, [
      refresh_token
    ])) as RefreshToken[]
    return results[0]
  }

  async deleteToken(refresh_token: string): Promise<any> {
    return await databaseService.query(`DELETE FROM ${this.tableName} WHERE refresh_token = ?`, [refresh_token])
  }
}
