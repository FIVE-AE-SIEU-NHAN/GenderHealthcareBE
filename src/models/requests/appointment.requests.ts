import { BookingStatus, TimeSlot, Topic } from '@prisma/client'
import { ParsedQs } from 'qs'

export interface BookAppointmentReqBody {
  topic: Topic
  booking_date: Date
  time_slot: TimeSlot
  note?: string
}

export interface GetAppointmentReqQuery {
  _start_date?: string
  _end_date?: string
  _topic?: Topic[]
  _status?: BookingStatus[]
}

export interface EditStatusUserReqBody {
  status: BookingStatus
}

export interface EditReqQuery extends ParsedQs {
  id: string
}
