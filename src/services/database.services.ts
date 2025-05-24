import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

class DatabaseService {
  private pool: mysql.Pool

  constructor() {
    this.pool = mysql.createPool({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '123456',
      database: 'GenderForCare',
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

// Create a singleton instance
const databaseService = new DatabaseService()

export default databaseService
