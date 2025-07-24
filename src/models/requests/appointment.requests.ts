import { BookingStatus, Gender, PackageLevel, TestServiceBookingStatus, TimeSlot, Topic } from '@prisma/client'
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
  status: TestServiceBookingStatus
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

export interface UpdateTestServiceResultReqBody {
  test_service_appointment_id: string
  result: string
  unit?: string
  test_date: Date
  note?: string
}
