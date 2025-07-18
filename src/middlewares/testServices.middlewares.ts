import { BookingStatus, Gender, PackageLevel, TimeSlot, Topic } from '@prisma/client'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const bookTestServiceAppointmentValidator = validate(
  checkSchema(
    {
      target_gender: {
        notEmpty: {
          errorMessage: APPOINTMENT_MESSAGES.TARGET_GENDER_IS_REQUIRED
        },
        isString: {
          errorMessage: APPOINTMENT_MESSAGES.TARGET_GENDER_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            const validGenders = Object.values(Gender)
            if (!validGenders.includes(value.toLowerCase())) {
              throw new Error(APPOINTMENT_MESSAGES.TARGET_GENDER_IS_INVALID)
            }
            return true
          }
        }
      },
      level: {
        notEmpty: {
          errorMessage: APPOINTMENT_MESSAGES.LEVEL_IS_REQUIRED
        },
        isString: {
          errorMessage: APPOINTMENT_MESSAGES.LEVEL_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            const validLevels = Object.values(PackageLevel)
            if (!validLevels.includes(value.toLowerCase())) {
              throw new Error(APPOINTMENT_MESSAGES.LEVEL_IS_INVALID)
            }
            return true
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
      },
      note: {
        optional: true,
        isString: {
          errorMessage: APPOINTMENT_MESSAGES.NOTE_MUST_BE_STRING
        },
        isLength: {
          options: {
            max: 500
          },
          errorMessage: APPOINTMENT_MESSAGES.NOTE_MUST_BE_LENGTH
        }
      }
    },
    ['body']
  )
)
