import { TimeSlot, Topic } from '@prisma/client'

export interface BookAppointmentReqBody {
  topic: Topic
  booking_date: Date
  time_slot: TimeSlot
}
