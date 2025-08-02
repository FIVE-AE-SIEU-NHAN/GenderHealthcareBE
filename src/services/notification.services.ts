import { NotificationType, TimeSlot } from '@prisma/client'
import NotificationRepository from '~/repositories/notification.repository'
import usersServices from './users.services'
import { ErrorWithStatus } from '~/models/Errors'
import { notificationQueue } from '~/queues/queue'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

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
      SLOT_07_08: '07:00',
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
        status: HTTP_STATUS.NOT_FOUND,
        message: NOTIFICATIONS_MESSAGES.CONSULTANT_NOT_FOUND
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

  async addNotificationForStaffAppointment(
    user_id: string,
    staff_id: string,
    appointment_id: string,
    booking_date: Date,
    time_slot: TimeSlot
  ) {
    // map time_slot
    const timeSlotStartMap: Record<TimeSlot, string> = {
      SLOT_07_08: '07:00',
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
    const staffContent = `You have an appointment with customer at ${timeSlotStartMap[time_slot]} ${date[1]}-${date[0]}-${date[2]}`

    // 1. Lưu thông báo vào database
    // lấy user_id của staff
    const staff = await usersServices.getUserIdOfStaff(staff_id)

    if (!staff) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: NOTIFICATIONS_MESSAGES.STAFF_NOT_FOUND
      })
    }

    const [{ id: notification_id_of_customer }, { id: notification_id_of_staff }] = await Promise.all([
      this.notificationRepository.createNotification({
        user_id,
        type: NotificationType.SERVICE_REMINDER_1D,
        content: customerContent,
        scheduled_time: booking_date,
        question_id: '',
        appointment_id: '',
        test_service_appointment_id: appointment_id
      }),
      this.notificationRepository.createNotification({
        user_id: staff.user_id,
        type: NotificationType.SERVICE_REMINDER_1D,
        content: staffContent,
        scheduled_time: booking_date,
        question_id: '',
        appointment_id: '',
        test_service_appointment_id: appointment_id
      })
    ])

    // 2. Gọi bull để lưu job thông báo và đặt thời gian gửi thông báo
    // map thời gian để tính toán delay
    const time = timeSlotStartMap[time_slot as TimeSlot]
    const now = new Date()
    // tính thời gian map từ utc+7 sang utc
    const date_time = new Date(`${booking_date.toISOString().split('T')[0]}T${time}:00`)

    // tính thời gian gửi thông báo là 1 ngày trước thời gian hẹn
    const delay = date_time.getTime() - now.getTime() - 1 * 24 * 60 * 60 * 1000

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
          user_id: staff.user_id,
          notification_id: notification_id_of_staff,
          content: staffContent
        },
        {
          delay,
          jobId: `staff-${notification_id_of_staff}`,
          removeOnComplete: true
        }
      )
    ])
  }

  async createNotification({
    user_id,
    type = NotificationType.OTHER,
    content,
    booking_date,
    appointment_id,
    question_id,
    test_service_appointment_id,
    is_send
  }: {
    user_id: string
    type?: NotificationType
    content: string
    booking_date: Date
    appointment_id?: string
    question_id?: string
    test_service_appointment_id?: string
    is_send?: boolean
  }) {
    return this.notificationRepository.createNotification({
      user_id,
      type,
      content,
      scheduled_time: booking_date,
      question_id,
      appointment_id,
      test_service_appointment_id,
      is_send
    })
  }
}

const notificationServices = new NotificationService()
export default notificationServices
