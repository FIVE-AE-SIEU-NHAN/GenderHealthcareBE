import PayOS from '@payos/node'
import { PaymentStatus } from '@prisma/client'
import axios from 'axios'
import PaymentRepository from '~/repositories/payment.repository'

const payOSInstance = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
)

class PaymentService {
  private paymentRepository: PaymentRepository

  constructor() {
    this.paymentRepository = new PaymentRepository()
  }

  async createConsultantPaymentLink({
    topic,
    amount,
    appointment_id,
    user_id
  }: {
    topic: string
    amount: number
    appointment_id: string
    user_id: string
  }) {
    const orderCode = Number(String(Date.now()).slice(-6))
    const description = `PAYMENT FOR CONSULTATION`

    const response = await payOSInstance.createPaymentLink({
      orderCode,
      amount,
      description,
      returnUrl: `localhost:5173`,
      cancelUrl: `localhost:5173`,
      items: [
        {
          name: `Tư vấn ${topic}`,
          quantity: 1,
          price: amount
        }
      ]
    })

    // lưu thông tin thanh toán vào database
    await this.paymentRepository.createPayment({
      appointment_id,
      user_id,
      amount,
      payos_order_code: String(response.orderCode)
    })

    return response
  }

  async updatePaymentStatus(orderCode: string, status: PaymentStatus) {
    return await this.paymentRepository.updatePaymentStatus(orderCode, status)
  }

  async cancelPaymentOnPayOS(orderCode: string) {
    return axios.post(
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
  }

  async checkPaymentStatusOnPayOS(orderCode: string) {
    return axios.get(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
      headers: {
        'x-client-id': process.env.PAYOS_CLIENT_ID!,
        'x-api-key': process.env.PAYOS_API_KEY!,
        'Content-Type': 'application/json'
      }
    })
  }

  async getPaymentByOrderCode(orderCode: string) {
    return await this.paymentRepository.getPaymentByOrderCode(orderCode)
  }
}

const paymentServices = new PaymentService()
export default paymentServices
