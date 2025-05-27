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

  async updateGoogleId(email: string, google_id: string): Promise<any> {
    return await databaseService.query(`UPDATE ${this.tableName} SET google_id = ? WHERE email = ?`, [google_id, email])
  }

  async updatePassword(email: string, password: string): Promise<any> {
    return await databaseService.query(`UPDATE ${this.tableName} SET password = ? WHERE email = ?`, [password, email])
  }

  async updatePasswordById(user_id: string, password: string): Promise<any> {
    return await databaseService.query(`UPDATE ${this.tableName} SET password = ? WHERE _id = ?`, [password, user_id])
  }

  async findByEmail(email: string): Promise<User | null> {
    const results = (await databaseService.query(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email])) as User[]
    return results.length > 0 ? results[0] : null
  }
}
