import { PrismaClient } from '@prisma/client'

class PrismaService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'error']
    })
  }

  async connect() {
    try {
      await this.prisma.$connect()
      console.log('You successfully connected to MySQL via Prisma!')
    } catch (error) {
      console.error('Prisma connection failed:', error)
      throw error
    }
  }

  getClient() {
    return this.prisma
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

const prismaService = new PrismaService()

export default prismaService
