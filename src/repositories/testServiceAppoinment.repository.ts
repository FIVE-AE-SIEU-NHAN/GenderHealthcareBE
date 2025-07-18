import { TimeSlot } from '@prisma/client'
import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class TestServiceAppointmentsRepository {
  private model = prisma.testServiceAppointments

  async createTestServiceAppointment(data: {
    user_id: string
    staff_id: string
    package_id: string
    booking_date: Date
    time_slot: TimeSlot
    note?: string
  }) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        ...data,
        booking_date: new Date(data.booking_date)
      }
    })
  }

  async checkTestServiceAppointmentExists(staff_id: string, booking_date: Date, time_slot: TimeSlot) {
    return this.model.findFirst({
      where: {
        staff_id,
        booking_date,
        time_slot
      }
    })
  }
}
