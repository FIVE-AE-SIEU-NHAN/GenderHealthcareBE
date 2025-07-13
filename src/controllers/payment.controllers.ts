import { PaymentStatus } from '@prisma/client'
import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import { CancelPaymentReqBody } from '~/models/requests/payment.requests'
import appointmentServices from '~/services/appointment.services'
import notificationServices from '~/services/notification.services'
import paymentServices from '~/services/payment.services'

export const cancelPaymentController = async (
  req: Request<ParamsDictionary, any, CancelPaymentReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { orderCode } = req.body

  // gọi API của PayOS để hủy thanh toán
  const response = await axios.post(
    `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}/cancel`,
    {},
    {
      headers: {
        'x-client-id': process.env.PAYOS_CLIENT_ID!,
        'x-api-key': process.env.PAYOS_API_KEY!,
        'Content-Type': 'application/json'
      }
    }
  )

  // cập nhật trạng thái thanh toán thành CANCELLED trong database
  const payment = await paymentServices.updatePaymentStatus(orderCode, PaymentStatus.CANCELLED)

  // xóa appointment đã giữ chỗ
  await appointmentServices.deleteAppointment(payment.appointment_id)

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.CANCEL_PAYMENT_SUCCESS,
    result: response.data
  })
}

export const webhookPaymentController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { orderCode, status } = req.body

  switch (status) {
    case 'PAID': {
      // cập nhật trạng thái thanh toán thành SUCCESS trong database
      const { appointment_id } = await paymentServices.updatePaymentStatus(orderCode, PaymentStatus.SUCCESS)

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

      break
    }

    case 'CANCELLED':
      console.log(`Payment with orderCode ${orderCode} was cancelled.`)
      break

    case 'FAILED':
      console.log(`Payment with orderCode ${orderCode} failed.`)
      break

    case 'EXPIRED':
      console.log(`Payment with orderCode ${orderCode} expired.`)
      break

    case 'REFUNDED':
      console.log(`Payment with orderCode ${orderCode} was refunded.`)
      break

    default:
      console.warn(`Unknown payment status received: ${status}`)
      break
  }

  res.status(HTTP_STATUS.OK).json({
    message: PAYMENT_MESSAGES.WEBHOOK_RECEIVED
  })
}
