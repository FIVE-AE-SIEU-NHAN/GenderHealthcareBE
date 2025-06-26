import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { NotificationType } from '@prisma/client'
import { create } from 'lodash'

export default class NotificationRepository {
  private model = prisma.notifications

  async getNotifications() {
    return this.model.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
  }

  async createNotification({
    user_id,
    type,
    content,
    scheduled_time,
    appointment_id,
    question_id
  }: {
    user_id: string
    type: NotificationType
    content: string
    scheduled_time: Date
    appointment_id?: string
    question_id?: string
  }) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        user_id,
        type,
        content,
        scheduled_time,
        ...(appointment_id && { appointment_id }),
        ...(question_id && { question_id }),
        created_at: new Date()
      }
    })
  }
}
