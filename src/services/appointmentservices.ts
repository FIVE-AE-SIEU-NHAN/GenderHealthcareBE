import { TimeSlot, Topic } from '@prisma/client'
import AppointmentRepository from '~/repositories/appointment.repository'

class AppointmentServices {
  private appointmentRepository: AppointmentRepository

  constructor() {
    this.appointmentRepository = new AppointmentRepository()
  }

  async checkAppointmentExists(consultant_id: string, booking_date: Date, time_slot: TimeSlot) {
    const consultant = await this.appointmentRepository.checkAppointmentExists(consultant_id, booking_date, time_slot)
    return consultant ? true : false
  }

  async createAppointment(data: {
    user_id: string
    consultant_id: string
    topic: Topic
    booking_date: Date
    time_slot: TimeSlot
  }) {
    console.log(data)
    return this.appointmentRepository.createAppointment(data)
  }
}

const appointmentServices = new AppointmentServices()
export default appointmentServices
