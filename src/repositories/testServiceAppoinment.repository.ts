import { BookingStatus, TestServiceBookingStatus, TimeSlot } from '@prisma/client'
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

  async getTestServiceAppointmentById(id: string) {
    return this.model.findUnique({
      where: { id },
      select: {
        booking_date: true,
        time_slot: true,
        staff_id: true,
        user_id: true,
        status: true,
        package_id: true
      }
    })
  }

  async deleteTestServiceAppointment(appointment_id: string) {
    return this.model.delete({
      where: { id: appointment_id }
    })
  }

  async updateStatusTestServiceAppointment(id: string, status: TestServiceBookingStatus) {
    return this.model.update({
      where: { id },
      data: { status }
    })
  }

  async getStaffTestServiceAppointments({
    staff_id,
    start_day,
    end_day,
    status
  }: {
    staff_id: string
    start_day?: Date
    end_day?: Date
    status?: BookingStatus[]
  }) {
    return this.model.findMany({
      where: {
        staff_id,
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

  async getManagerTestServiceAppointments({
    start_day,
    end_day,
    status
  }: {
    start_day?: Date
    end_day?: Date
    status?: BookingStatus[]
  }) {
    return this.model.findMany({
      where: {
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

  async getCustomerTestServiceAppointments(user_id: string) {
    return this.model.findMany({
      select: {
        booking_date: true,
        time_slot: true,
        status: true,
        package_id: true,
        note: true
      },
      where: {
        user_id
      }
    })
  }
}
