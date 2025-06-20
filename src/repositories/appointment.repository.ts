import { TimeSlot, Topic } from '@prisma/client'
import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class AppointmentRepository {
  private model = prisma.appointments

  async checkAppointmentExists(consultant_id: string, booking_date: Date, time_slot: TimeSlot) {
    return this.model.findFirst({
      where: {
        consultant_id,
        booking_date,
        time_slot
      }
    })
  }

  async createAppointment(data: {
    user_id: string
    consultant_id: string
    topic: Topic
    booking_date: Date
    time_slot: TimeSlot
  }) {
    const id = ObjectId()
    return await this.model.create({
      data: {
        id,
        ...data,
        created_at: new Date()
      }
    })
  }
}
