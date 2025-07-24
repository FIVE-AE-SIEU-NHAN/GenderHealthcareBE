import { BookingStatus, Gender, PackageLevel, TimeSlot, Topic } from '@prisma/client'
import { ParsedQs } from 'qs'

export interface BookAppointmentReqBody {
  topic: Topic
  booking_date: Date
  time_slot: TimeSlot
  note?: string
}

export interface GetAppointmentReqQuery extends ParsedQs {
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

export interface BookTestServiceAppointmentReqBody {
  target_gender: Gender
  level: PackageLevel
  booking_date: Date
  time_slot: TimeSlot
  note?: string
}

export interface GetTestServiceAppointmentReqQuery extends ParsedQs {
  _start_date: string
  _end_date: string
  _status?: BookingStatus[]
}
