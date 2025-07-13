import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import { CancelPaymentReqBody } from '~/models/requests/payment.requests'
import appointmentServices from '~/services/appointment.services'
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
  const payment = await paymentServices.cancelConsultantPayment(orderCode)

  // xóa appointment đã giữ chỗ
  await appointmentServices.deleteAppointment(payment.appointment_id)

  res.status(200).json({
    message: PAYMENT_MESSAGES.CANCEL_PAYMENT_SUCCESS,
    result: response.data
  })
}
