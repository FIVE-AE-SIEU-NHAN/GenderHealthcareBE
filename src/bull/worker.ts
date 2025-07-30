import redisUtils from '~/utils/redis'
import { cycleQueue, notificationQueue, paymentQueue } from './queue'
import notificationServices from '~/services/notification.services'
import socketService from '~/socket/socket'
import paymentServices from '~/services/payment.services'
import { CyclePredictionStatus, NotificationType, PaymentStatus } from '@prisma/client'
import appointmentServices from '~/services/appointment.services'
import testServiceServices from '~/services/testService.services'
import cycleServices from '~/services/cycle.services'
import { ReminderPillLogType } from '~/constants/enums'
import { log } from 'console'
import { add } from 'lodash'
import { addDays, addHours } from 'date-fns'

notificationQueue.process('notification-for-customer', async (job) => {
  const { user_id, notification_id, content } = job.data
  const isOnline = await redisUtils.isUserOnline(user_id)
  if (isOnline) {
    socketService.sendNotification(user_id, notification_id, content)
  }

  // cập nhật trạng thái đã gửi thông báo
  await notificationServices.updateNotificationSendStatus(notification_id)

  // gửi thông báo đến người dùng qua socket
  socketService.sendNotification(user_id, notification_id, content)
})

paymentQueue.process('cancel-payment-after-15-minutes', async (job) => {
  const { orderCode, user_id } = job.data

  // kiểm tra trạng thái cuối cùng của thanh toán trên PayOS
  const { data } = await paymentServices.checkPaymentStatusOnPayOS(orderCode)
  if (data.status === 'PAID') {
    // nếu đã thanh toán thì không cần hủy, chỉ cần cập nhật trạng thái
    await paymentServices.updatePaymentStatus(orderCode, PaymentStatus.SUCCESS)
    return
  }

  // nếu đã thanh toán thì webhook sẽ gọi paymentQueue để xóa job này rồi
  // nếu chưa thanh toán thì hủy:
  // 1. gọi API của PayOS để hủy thanh toán
  // 2. cập nhật trạng thái thanh toán thành FAILED trong database
  const [response, payment] = await Promise.all([
    paymentServices.cancelPaymentOnPayOS(orderCode),
    paymentServices.updatePaymentStatus(orderCode, PaymentStatus.FAILED)
  ])
  // 3. xóa appointment đã giữ chỗ
  // kiểm tra là loại appointment nào
  const appointment = await appointmentServices.getAppointmentById(payment.appointment_id)
  if (!appointment) {
    await testServiceServices.deleteTestServiceAppointment(payment.appointment_id)
  } else {
    await appointmentServices.deleteAppointment(payment.appointment_id)
  }
  // 4. gửi thông báo hết hạn cho người dùng qua socket
  const content = `Your appointment payment has expired. Please reschedule if necessary.`
  socketService.sendStatusPayment(user_id, PaymentStatus.FAILED, content)
})

cycleQueue.process('set-completed-for-cycle', async (job) => {
  // 1. Lấy thông tin chu kỳ từ job
  const { user_id } = job.data
  // 2.  Cập nhật trạng thái chu kỳ thành COMPLETED
  await cycleServices.updateCycleStatus(user_id, CyclePredictionStatus.COMPLETED)
})

cycleQueue.process('notification_contraceptive_pill_reminder_8h', async (job) => {
  console.log('\x1b[33mWorker\x1b[0m is processing notification_contraceptive_pill_reminder_8h job...')
  const { user_id } = job.data
  const log_date = addHours(new Date(), 7)
  const pillLog = await cycleServices.getPillLogByUserIdAndDate(user_id, new Date(log_date))
  if (!pillLog?.taken) {
    // 1. Cập nhật đã gửi nhật ký uống thuốc tránh thai
    await cycleServices.updatePillLogReminder(user_id, log_date.toISOString(), ReminderPillLogType.EightAM)

    const content = `You have a contraceptive pill to take today (${log_date}). Please remember to take it on time!`
    // 2. Tạo thông báo
    const { id: notification_id } = await notificationServices.createNotification({
      user_id,
      booking_date: new Date(log_date),
      content,
      type: NotificationType.OTHER,
      is_send: true
    })

    // 3. Bắn socket thông báo
    socketService.sendNotification(user_id, notification_id, content)
  }
})

cycleQueue.process('notification_contraceptive_pill_reminder_20h', async (job) => {
  console.log('\x1b[33mWorker\x1b[0m is processing notification_contraceptive_pill_reminder_20h job...')
  const { user_id } = job.data
  const log_date = addHours(new Date(), 7)
  // Kiểm tra xem người dùng có đang uống thuốc tránh thai không
  const pillLog = await cycleServices.getPillLogByUserIdAndDate(user_id, new Date(log_date))
  if (!pillLog?.taken) {
    // 1. Cập nhật nhật ký uống thuốc tránh thai
    await cycleServices.updatePillLogReminder(user_id, log_date.toISOString(), ReminderPillLogType.EightPM)

    const content = `Did you take your pill today? If you haven't, now's the time!`
    // 2. Tạo thông báo
    const { id: notification_id } = await notificationServices.createNotification({
      user_id,
      booking_date: new Date(log_date),
      content,
      type: NotificationType.OTHER,
      is_send: true
    })

    // 3. Bắn socket thông báo
    socketService.sendNotification(user_id, notification_id, content)
  }
})

cycleQueue.process('notification_contraceptive_pill_reminder_canceled', async (job) => {
  console.log('\x1b[33mWorker\x1b[0m is processing notification_contraceptive_pill_reminder_canceled job...')
  const { user_id } = job.data
  const log_date = addHours(new Date(), 7)

  // 1. Kiểm tra xem người dùng có đang uống thuốc tránh thai không
  const pillLog = await cycleServices.getPillLogByUserIdAndDate(user_id, new Date(log_date))
  if (!pillLog?.taken) {
    // Xóa 3 job nhắc nhở mỗi ngày
    await Promise.all([
      cycleQueue.removeRepeatable('notification_contraceptive_pill_reminder_8h', {
        cron: '00 80 * * *',
        tz: 'Asia/Ho_Chi_Minh',
        jobId: `pill-reminder-8h-${user_id}`
      }),
      cycleQueue.removeRepeatable('notification_contraceptive_pill_reminder_20h', {
        cron: '00 20 * * *',
        tz: 'Asia/Ho_Chi_Minh',
        jobId: `pill-reminder-20h-${user_id}`
      }),
      cycleQueue.removeRepeatable('notification_contraceptive_pill_reminder_canceled', {
        cron: '59 23 * * *',
        tz: 'Asia/Ho_Chi_Minh',
        jobId: `pill-reminder-canceled-${user_id}`
      })
    ])

    // Gửi thông báo hủy nhắc nhở
    const content = `You will no longer receive reminders for contraceptive pills`
    const { id: notification_id } = await notificationServices.createNotification({
      user_id,
      booking_date: new Date(log_date),
      content,
      type: NotificationType.OTHER,
      is_send: true
    })

    // Bắn socket thông báo
    socketService.sendNotification(user_id, notification_id, content)
    return
  }

  // 2. Nếu có thì tạo PillLog cho ngày mai
  const next_day = addDays(log_date, 1)
  next_day.setHours(0, 0, 0, 0)
  await cycleServices.createContraceptivePillReminder(user_id, next_day.toISOString())
})

console.log('\x1b[33mWorker\x1b[0m is running and listening for jobs...')
