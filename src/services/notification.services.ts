import { NotificationType, TimeSlot } from '@prisma/client'
import NotificationRepository from '~/repositories/notification.repository'
import usersServices from './users.services'
import { ErrorWithStatus } from '~/models/Errors'
import { notificationQueue } from '~/bull/queue'

class NotificationService {
  private notificationRepository: NotificationRepository

  constructor() {
    this.notificationRepository = new NotificationRepository()
  }

  async addNotificationForConsultantAppointment(
    user_id: string,
    consultant_id: string,
    appointment_id: string,
    booking_date: Date,
    time_slot: TimeSlot
  ) {
    // map time_slot
    const timeSlotStartMap: Record<TimeSlot, string> = {
      SLOT_07_08: '13:50',
      SLOT_08_09: '08:00',
      SLOT_09_10: '09:00',
      SLOT_10_11: '10:00',
      SLOT_13_14: '13:00',
      SLOT_14_15: '14:00',
      SLOT_15_16: '15:00',
      SLOT_16_17: '16:00'
    }

    // tạo content thông báo
    const date = booking_date.toLocaleDateString().split('/')
    const customerContent = `You have an appointment at ${timeSlotStartMap[time_slot]} ${date[1]}-${date[0]}-${date[2]}`
    const consultantContent = `You have an appointment with customer at ${timeSlotStartMap[time_slot]} ${date[1]}-${date[0]}-${date[2]}`

    // 1. Lưu thông báo vào database
    // lấy user_id của consultant
    const consultant = await usersServices.getUserIdOfConsultant(consultant_id)

    if (!consultant) {
      throw new ErrorWithStatus({
        status: 404,
        message: 'Consultant not found'
      })
    }

    const [{ id: notification_id_of_customer }, { id: notification_id_of_consultant }] = await Promise.all([
      this.notificationRepository.createNotification({
        user_id,
        type: NotificationType.APPOINTMENT_REMINDER_30M,
        content: customerContent,
        scheduled_time: booking_date,
        question_id: '',
        appointment_id
      }),
      this.notificationRepository.createNotification({
        user_id: consultant.user_id,
        type: NotificationType.APPOINTMENT_REMINDER_30M,
        content: consultantContent,
        scheduled_time: booking_date,
        question_id: '',
        appointment_id
      })
    ])

    // 2. Gọi bull để lưu job thông báo và đặt thời gian gửi thông báo
    // map thời gian để tính toán delay
    const time = timeSlotStartMap[time_slot as TimeSlot]
    const now = new Date()
    // tính thời gian map từ utc+7 sang utc
    const date_time = new Date(`${booking_date.toISOString().split('T')[0]}T${time}:00`)

    // tính thời gian gửi thông báo là 30 phút trước thời gian hẹn
    const delay = date_time.getTime() - now.getTime() - 30 * 60 * 1000

    console.log('Gửi thông báo sau: ', delay)

    await Promise.all([
      notificationQueue.add(
        'notification-for-customer',
        {
          user_id,
          notification_id: notification_id_of_customer,
          content: customerContent
        },
        {
          delay,
          jobId: `customer-${notification_id_of_customer}`,
          removeOnComplete: true
        }
      ),
      notificationQueue.add(
        'notification-for-customer',
        {
          user_id: consultant.user_id,
          notification_id: notification_id_of_consultant,
          content: consultantContent
        },
        {
          delay,
          jobId: `consultant-${notification_id_of_consultant}`,
          removeOnComplete: true
        }
      )
    ])
  }

  async updateNotificationSendStatus(notification_id: string) {
    return this.notificationRepository.updateNotificationSendStatus(notification_id)
  }

  async getNotifications(user_id: string) {
    const [notifications, isNotRead] = await Promise.all([
      this.notificationRepository.getNotifications(user_id),
      this.notificationRepository.getUnreadNotificationCount(user_id)
    ])

    return {
      notifications,
      isNotRead
    }
  }

  async updateNotifications(user_id: string) {
    return this.notificationRepository.updateNotifications(user_id)
  }
}

const notificationServices = new NotificationService()
export default notificationServices
