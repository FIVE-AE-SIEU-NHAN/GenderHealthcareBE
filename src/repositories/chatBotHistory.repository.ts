import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { ChatBotRole } from '@prisma/client'

export default class ChatBotHistoryRepository {
  private model = prisma.chatBotHistory

  async createChatBotHistory(data: { user_id: string; role: ChatBotRole; message: string }) {
    const id = ObjectId()
    return await this.model.create({
      data: {
        id,
        ...data,
        status: 1
      }
    })
  }

  async getChatBotHistoryByUserId(user_id: string) {
    return await this.model.findMany({
      where: { user_id, status: 1 },
      orderBy: { created_at: 'desc' }
    })
  }

  async updateChatBotHistoryStatus(user_id: string) {
    return await this.model.updateMany({
      where: { user_id, status: 1 },
      data: { status: 0 }
    })
  }
}
