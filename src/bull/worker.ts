import redisUtils from '~/utils/redis'
import { notificationQueue, paymentQueue } from './queue'
import notificationServices from '~/services/notification.services'
import socketService from '~/socket/socket'
import paymentServices from '~/services/payment.services'
import { PaymentStatus } from '@prisma/client'
import appointmentServices from '~/services/appointment.services'

notificationQueue.process('notification-for-customer', async (job) => {
  const { user_id, notification_id, content } = job.data
  const isOnline = await redisUtils.isUserOnline(user_id)
  if (isOnline) {
    socketService.sendNotification(user_id, notification_id, content)
  }

  console.log('>>> ', notification_id)

  await notificationServices.updateNotificationSendStatus(notification_id)
})

paymentQueue.process('cancel-payment-after-15-minutes', async (job) => {
  const { orderCode, user_id } = job.data

  // nếu đã thanh toán thì webhook sẽ gọi paymentQueue để xóa job này rồi
  // nếu chưa thanh toán thì hủy:
  // 1. gọi API của PayOS để hủy thanh toán
  // 2. cập nhật trạng thái thanh toán thành FAILED trong database
  const [response, payment] = await Promise.all([
    paymentServices.cancelPaymentOnPayOS(orderCode),
    paymentServices.updatePaymentStatus(orderCode, PaymentStatus.FAILED)
  ])
  // 3. xóa appointment đã giữ chỗ
  await appointmentServices.deleteAppointment(payment.appointment_id)
  // 4. gửi thông báo hết hạn cho người dùng qua socket
  const content = `Your appointment payment has expired. Please reschedule if necessary.`
  socketService.sendStatusPayment(user_id, PaymentStatus.FAILED, content)
})

console.log('\x1b[33mWorker\x1b[0m is running and listening for jobs...')
