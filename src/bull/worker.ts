import redisUtils from '~/utils/redis'
import { cycleQueue, notificationQueue, paymentQueue } from './queue'
import notificationServices from '~/services/notification.services'
import socketService from '~/socket/socket'
import paymentServices from '~/services/payment.services'
import { CyclePredictionStatus, PaymentStatus } from '@prisma/client'
import appointmentServices from '~/services/appointment.services'
import testServiceServices from '~/services/testService.services'
import cycleServices from '~/services/cycle.services'

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

console.log('\x1b[33mWorker\x1b[0m is running and listening for jobs...')
