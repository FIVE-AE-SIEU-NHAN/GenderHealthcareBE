import BaseRepository from './base.repository'
import User from '../models/User.schema'
import databaseService from '../services/database.services'
import { hashPassword } from '~/utils/crypto'

export default class UserRepository extends BaseRepository<User> {
  constructor() {
    super('Users')
  }

  // Các phương thức đặc biệt cho bảng Users
  async checkLogin(email: string, password: string): Promise<User | null> {
    const results = (await databaseService.query(`SELECT * FROM ${this.tableName} WHERE email = ? AND password = ?`, [
      email,
      hashPassword(password)
    ])) as User[]

    return results.length > 0 ? results[0] : null
  }

  async checkEmailExist(email: string): Promise<User> {
    const results = (await databaseService.query(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email])) as User[]
    return results[0]
  }

  async updatePassword(id: number, password: string): Promise<any> {
    return await databaseService.query(`UPDATE ${this.tableName} SET password = ? WHERE id = ?`, [password, id])
  }

  // Các phương thức đặc thù khác...
}
