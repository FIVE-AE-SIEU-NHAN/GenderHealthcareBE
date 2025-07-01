import { BookingStatus, TimeSlot, Topic } from '@prisma/client'
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

  async getConsultantAppointments({
    consultant_id,
    start_day,
    end_day,
    topic,
    status
  }: {
    consultant_id: string
    start_day?: Date
    end_day?: Date
    topic?: Topic[]
    status?: BookingStatus[]
  }) {
    return this.model.findMany({
      where: {
        consultant_id,
        ...(topic && { topic: { in: topic } }),
        ...(status && { status: { in: status } }),
        ...(start_day &&
          end_day && {
            booking_date: {
              gte: `${start_day.toISOString().split('T')[0]}T00:00:00.000Z`,
              lte: `${end_day.toISOString().split('T')[0]}T23:59:59.999Z`
            }
          })
      }
    })
  }

  async getCustomerAppointments(user_id: string) {
    return this.model.findMany({
      where: {
        user_id
      },
      select: {
        topic: true,
        booking_date: true,
        time_slot: true,
        status: true,
        socket_room_id: true
      }
    })
  }

  async getAppointmentStatus(id: string) {
    return this.model.findUnique({
      where: {
        id
      },
      select: {
        status: true
      }
    })
  }

  async updateStatusAppointment(id: string, status: BookingStatus) {
    return this.model.update({
      where: { id },
      data: { status }
    })
  }

  async getManagerAppointments({
    start_day,
    end_day,
    topic,
    status
  }: {
    start_day?: Date
    end_day?: Date
    topic?: Topic[]
    status?: BookingStatus[]
  }) {
    return this.model.findMany({
      where: {
        ...(topic && { topic: { in: topic } }),
        ...(status && { status: { in: status } }),
        ...(start_day &&
          end_day && {
            created_at: {
              gte: `${start_day.toISOString().split('T')[0]}T00:00:00.000Z`,
              lte: `${end_day.toISOString().split('T')[0]}T23:59:59.999Z`
            }
          })
      }
    })
  }

  async checkValidBookingTime(bookingId: string, userId: string) {
    const booking = await prisma.appointments.findUnique({ where: { id: bookingId } })
  }
}
