import { NotificationType, TimeSlot } from '@prisma/client'
import { notificationQueue } from '~/bull/notificationQueue.bull'
import NotificationRepository from '~/repositories/notification.repository'

class NotificationService {
  private notificationRepository: NotificationRepository

  constructor() {
    this.notificationRepository = new NotificationRepository()
  }

  async addNotificationForConsultantAppointment(
    user_id: string,
    appointment_id: string,
    booking_date: Date,
    time_slot: TimeSlot
  ) {
    // map time_slot
    const timeSlotStartMap: Record<TimeSlot, string> = {
      SLOT_08_10: '09:38',
      SLOT_10_12: '10:00',
      SLOT_13_15: '13:00',
      SLOT_15_17: '15:00'
    }

    // tạo content thông báo
    const date = booking_date.toLocaleDateString().split('/')
    const content = `Bạn có một cuộc hẹn vào lúc ${timeSlotStartMap[time_slot]} ${date[1]}-${date[0]}-${date[2]}`

    // 1. Lưu thông báo vào database
    const { id: notification_id } = await this.notificationRepository.createNotification({
      user_id,
      type: NotificationType.APPOINTMENT_REMINDER_30M,
      content,
      scheduled_time: booking_date,
      question_id: '',
      appointment_id
    })

    // 2. Gọi bull để lưu job thông báo và đặt thời gian gửi thông báo
    // map thời gian để tính toán delay
    const time = timeSlotStartMap[time_slot as TimeSlot]
    const now = new Date()
    // tính thời gian map từ utc+7 sang utc
    const date_time = new Date(`${booking_date.toISOString().split('T')[0]}T${time}:00`)

    // tính thời gian gửi thông báo là 30 phút trước thời gian hẹn
    const delay = date_time.getTime() - now.getTime() - 30 * 60 * 1000

    console.log('Gửi thông báo sau: ', delay)

    notificationQueue.add(
      'send-noti-of-cosultant-booking',
      {
        user_id,
        appointment_id,
        content
      },
      {
        delay,
        jobId: notification_id,
        removeOnComplete: true
      }
    )
  }
}

const notificationService = new NotificationService()
export default notificationService
