import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { PaymentStatus } from '@prisma/client'

export default class PaymentRepository {
  private model = prisma.payments

  async createPayment({
    appointment_id,
    user_id,
    amount,
    payos_order_code
  }: {
    appointment_id: string
    user_id: string
    amount: number
    payos_order_code: string
  }) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        appointment_id,
        user_id,
        amount,
        payos_order_code,
        status: PaymentStatus.PENDING
      }
    })
  }

  async updatePaymentStatus(orderCode: string, status: PaymentStatus) {
    return this.model.update({
      where: { payos_order_code: orderCode },
      data: { status }
    })
  }
}
