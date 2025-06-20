import { BookingStatus, TimeSlot, Topic } from '@prisma/client'

export interface BookAppointmentReqBody {
  topic: Topic
  booking_date: Date
  time_slot: TimeSlot
}

export interface GetAppointmentReqQuery {
  _start_date?: string
  _end_date?: string
  _topic?: Topic[]
  _status?: BookingStatus[]
}
