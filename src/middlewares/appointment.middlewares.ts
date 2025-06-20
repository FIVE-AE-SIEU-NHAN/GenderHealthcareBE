import { TimeSlot, Topic } from '@prisma/client'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const bookAppointmentValidator = validate(
  checkSchema(
    {
      topic: {
        notEmpty: {
          errorMessage: APPOINTMENT_MESSAGES.TOPIC_IS_REQUIRED
        },
        custom: {
          options: async (values) => {
            const topicList = Object.values(Topic)
            if (!topicList.includes(values)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: APPOINTMENT_MESSAGES.TOPIC_IS_INVALID
              })
            }
          }
        }
      },
      booking_date: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: APPOINTMENT_MESSAGES.CREATED_AT_BE_ISO8601
        }
      },
      time_slot: {
        notEmpty: {
          errorMessage: APPOINTMENT_MESSAGES.TIME_SLOT_IS_REQUIRED
        },
        custom: {
          options: async (values) => {
            const timeSlotList = Object.values(TimeSlot)
            if (!timeSlotList.includes(values)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: APPOINTMENT_MESSAGES.TIME_SLOT_IS_INVALID
              })
            }
          }
        }
      }
    },
    ['body']
  )
)
