import { PaymentStatus } from '@prisma/client'
import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { paymentQueue } from '~/bull/queue'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CancelPaymentReqBody } from '~/models/requests/payment.requests'
import appointmentServices from '~/services/appointment.services'
import notificationServices from '~/services/notification.services'
import paymentServices from '~/services/payment.services'
import testServiceServices from '~/services/testService.services'
import socketService from '~/socket/socket'

export const cancelPaymentController = async (
  req: Request<ParamsDictionary, any, CancelPaymentReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { orderCode } = req.body

  // xóa job hủy thanh toán sau 15 phút nếu hủy thanh toán
  const job = await paymentQueue.getJob(orderCode)
  job && (await job.remove())

  const result = await paymentServices.getPaymentByOrderCode(orderCode)
  if (result?.status === PaymentStatus.CANCELLED) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.CONFLICT,
      message: PAYMENT_MESSAGES.PAYMENT_ALREADY_CANCELLED
    })
  }

  // gọi API của PayOS để hủy thanh toán
  // cập nhật trạng thái thanh toán thành CANCELLED trong database
  const [response, payment] = await Promise.all([
    paymentServices.cancelPaymentOnPayOS(orderCode),
    paymentServices.updatePaymentStatus(orderCode, PaymentStatus.CANCELLED)
  ])

  // kiểm tra là loại appointment nào
  // xóa appointment đã giữ chỗ
  const appointment = await appointmentServices.getAppointmentById(payment.appointment_id)
  if (!appointment) {
    await testServiceServices.deleteTestServiceAppointment(payment.appointment_id)
  } else {
    await appointmentServices.deleteAppointment(payment.appointment_id)
  }

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.CANCEL_PAYMENT_SUCCESS
  })
}

export const webhookPaymentController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { code, data } = req.body

  if (code === '00' && data?.orderCode !== 123) {
    const { orderCode } = data

    // xóa job hủy thanh toán sau 15 phút nếu đã thanh toán
    const job = await paymentQueue.getJob(orderCode)
    job && (await job.remove())

    // cập nhật trạng thái thanh toán thành SUCCESS trong database
    const { appointment_id } = await paymentServices.updatePaymentStatus(String(orderCode), PaymentStatus.SUCCESS)

    const { description } = data
    if (description.includes('CONSULTATION')) {
      // lấy thông tin lịch hẹn
      const { user_id, consultant_id, booking_date, time_slot } =
        await appointmentServices.getAppointmentById(appointment_id)
      // lưu lịch hẹn vào redis để gửi thông báo và lưu vào database
      await notificationServices.addNotificationForConsultantAppointment(
        user_id,
        consultant_id,
        appointment_id,
        new Date(booking_date),
        time_slot
      )

      // gửi thông báo thành công cho người dùng qua socket
      const content = `Book consultant successfully`
      socketService.sendStatusPayment(user_id, PaymentStatus.SUCCESS, content)
    } else if (description.includes('TEST SERVICE')) {
      // lấy thông tin lịch hẹn
      const { user_id, staff_id, booking_date, time_slot } =
        await testServiceServices.getTestServiceAppointmentById(appointment_id)

      // lưu lịch hẹn vào redis để gửi thông báo và lưu vào database
      await notificationServices.addNotificationForStaffAppointment(
        user_id,
        staff_id,
        appointment_id,
        new Date(booking_date),
        time_slot
      )

      // gửi thông báo thành công cho người dùng qua socket
      const content = `Book test service successfully`
      socketService.sendStatusPayment(user_id, PaymentStatus.SUCCESS, content)
    }
  }

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.WEBHOOK_RECEIVED
  })
}
