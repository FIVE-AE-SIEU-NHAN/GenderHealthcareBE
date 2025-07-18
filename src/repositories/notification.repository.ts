import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { NotificationType } from '@prisma/client'
import { create } from 'lodash'

export default class NotificationRepository {
  private model = prisma.notifications

  async createNotification({
    user_id,
    type,
    content,
    scheduled_time,
    appointment_id,
    question_id,
    test_service_appointment_id
  }: {
    user_id: string
    type: NotificationType
    content: string
    scheduled_time: Date
    appointment_id?: string
    question_id?: string
    test_service_appointment_id?: string
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
        ...(test_service_appointment_id && { test_service_appointment_id }),
        created_at: new Date()
      }
    })
  }

  async updateNotificationSendStatus(notification_id: string) {
    return this.model.update({
      where: { id: notification_id },
      data: { is_sent: true }
    })
  }

  async getNotifications(user_id: string) {
    return this.model.findMany({
      select: {
        id: true,
        type: true,
        content: true,
        is_read: true
      },
      where: { user_id, is_sent: true, scheduled_time: { lte: new Date() } },
      orderBy: { created_at: 'desc' }
    })
  }

  async getUnreadNotificationCount(user_id: string) {
    return this.model.count({
      where: { user_id, is_sent: true, is_read: false, scheduled_time: { lte: new Date() } }
    })
  }

  async updateNotifications(user_id: string) {
    return this.model.updateMany({
      where: { user_id, is_sent: true, is_read: false, scheduled_time: { lte: new Date() } },
      data: { is_read: true }
    })
  }
}
