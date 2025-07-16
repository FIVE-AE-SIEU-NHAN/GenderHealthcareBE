import { BookingStatus, TimeSlot, Topic } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { GetAppointmentReqQuery } from '~/models/requests/appointment.requests'
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
    note?: string
  }) {
    return this.appointmentRepository.createAppointment(data)
  }

  async getConsultantAppointments(consultant_id: string, payload: GetAppointmentReqQuery) {
    const { _start_date, _end_date, _topic, _status } = payload

    const start_day = new Date(_start_date!)
    const end_day = new Date(_end_date!)
    const topic = Array.isArray(_topic) ? _topic : _topic ? [_topic] : undefined
    const status = Array.isArray(_status) ? _status : _status ? [_status] : undefined

    const appointments = await this.appointmentRepository.getConsultantAppointments({
      consultant_id,
      start_day,
      end_day,
      topic,
      status
    })

    return {
      appointments,
      total: appointments.length
    }
  }

  async getCustomerAppointments(user_id: string) {
    return await this.appointmentRepository.getCustomerAppointments(user_id)
  }

  async editStatusAppointment(id: string, status: BookingStatus) {
    const appointment = await this.appointmentRepository.getAppointmentStatus(id)
    if (!appointment) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND
      })
    }
    if (appointment.status === status) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.APPOINTMENT_ALREADY_IN_THIS_STATUS
      })
    }
    return this.appointmentRepository.updateStatusAppointment(id, status)
  }

  async getManagerAppointments(payload: GetAppointmentReqQuery) {
    const { _start_date, _end_date, _topic, _status } = payload

    const start_day = new Date(_start_date!)
    const end_day = new Date(_end_date!)
    const topic = Array.isArray(_topic) ? _topic : _topic ? [_topic] : undefined
    const status = Array.isArray(_status) ? _status : _status ? [_status] : undefined

    const appointments = await this.appointmentRepository.getManagerAppointments({
      start_day,
      end_day,
      topic,
      status
    })

    return {
      appointments,
      total: appointments.length
    }
  }

  async deleteAppointment(appointment_id: string) {
    return this.appointmentRepository.deleteAppointmentById(appointment_id)
  }

  async getAppointmentById(appointment_id: string) {
    const appointment = await this.appointmentRepository.getAppointmentById(appointment_id)
    if (!appointment) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.APPOINTMENT_NOT_FOUND
      })
    }
    return appointment
  }
}

const appointmentServices = new AppointmentServices()
export default appointmentServices
