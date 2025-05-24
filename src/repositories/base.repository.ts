import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '../services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import e from 'express'
import { MysqlError } from 'mysql'
import { USERS_MESSAGES } from '~/constants/messages'

export default abstract class BaseRepository<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  async findAll(): Promise<T[]> {
    return (await databaseService.query(`SELECT * FROM ${this.tableName}`)) as T[]
  }

  async findById(id: number): Promise<T | null> {
    const results = (await databaseService.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id])) as T[]

    return results.length > 0 ? results[0] : null
  }

  async create(entity: Partial<T>): Promise<any> {
    try {
      const keys = Object.keys(entity)
      const values = Object.values(entity)

      const placeholders = keys.map(() => '?').join(', ')
      const query = `
        INSERT INTO ${this.tableName} (${keys.join(', ')})
        VALUES (${placeholders})
      `

      return await databaseService.query(query, values)
    } catch (error: MysqlError | any) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.code === 'ER_DUP_ENTRY' ? USERS_MESSAGES.EMAIL_ALREADY_EXISTS : error.message
      })
    }
  }

  async update(id: number, entity: Partial<T>): Promise<any> {
    const keys = Object.keys(entity)
    const values = Object.values(entity)

    const setClause = keys.map((key) => `${key} = ?`).join(', ')

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = ?
    `

    return await databaseService.query(query, [...values, id])
  }

  async delete(id: number): Promise<any> {
    return await databaseService.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id])
  }
}
