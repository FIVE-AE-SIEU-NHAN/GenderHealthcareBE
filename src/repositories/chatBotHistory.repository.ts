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
        ...data
      }
    })
  }

  async getChatBotHistoryByUserId(user_id: string) {
    return await this.model.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' }
    })
  }
}
