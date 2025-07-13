import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class MessageRepository {
  private model = prisma.messages

  async createMessage(appointment_id: string, sender_id: string, content: string) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        appointment_id,
        sender_id,
        content
      }
    })
  }
}
