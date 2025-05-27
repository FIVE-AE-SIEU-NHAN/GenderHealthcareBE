import mysql from 'mysql2/promise'

import dotenv from 'dotenv'

dotenv.config()
type Pool = ReturnType<typeof mysql.createPool>

class DatabaseService {
  private pool: Pool

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    })
  }

  async connect() {
    try {
      const [result] = await this.pool.query('SELECT 1 + 1 AS solution')
      console.log('You successfully connected to MySQL!')
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  }

  getPool() {
    return this.pool
  }

  async query(sql: string, params?: any[]) {
    try {
      const [results] = await this.pool.query(sql, params)
      return results
    } catch (error) {
      throw error
    }
  }
}

const databaseService = new DatabaseService()

export default databaseService
