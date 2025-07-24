import { BookingStatus, TestServiceBookingStatus, TimeSlot, Topic } from '@prisma/client'
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

export const getAppointmentValidator = validate(
  checkSchema(
    {
      _start_date: {
        notEmpty: {
          errorMessage: APPOINTMENT_MESSAGES.START_DATE_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: APPOINTMENT_MESSAGES.START_DATE_BE_ISO8601
        }
      },
      _end_date: {
        notEmpty: {
          errorMessage: APPOINTMENT_MESSAGES.END_DATE_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: APPOINTMENT_MESSAGES.END_DATE_BE_ISO8601
        }
      },
      _sort: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['id', 'topic', 'booking_date', 'time_slot', 'created_at', 'status', 'socket_room_id']
            if (!validOrders.includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: APPOINTMENT_MESSAGES.SORT_FIELD_IS_INVALID
              })
            }
            return true
          }
        }
      },
      _order: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['asc', 'desc']
            if (!validOrders.includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: APPOINTMENT_MESSAGES.ORDER_MUST_BE_ASC_OR_DESC
              })
            }
            return true
          }
        }
      },
      _topic: {
        optional: true,
        custom: {
          options: async (value) => {
            value = Array.isArray(value) ? value : [value]
            const topicList = Object.values(Topic)
            if (!value.every((topic: string) => topicList.includes(topic as Topic))) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: APPOINTMENT_MESSAGES.TOPIC_IS_INVALID
              })
            }
            return true
          }
        }
      },
      _status: {
        optional: true,
        custom: {
          options: (value) => {
            value = Array.isArray(value) ? value : [value]
            const validStatus = Object.values(BookingStatus)
            if (!value.every((status: string) => validStatus.includes(status as BookingStatus))) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: APPOINTMENT_MESSAGES.STATUS_IS_INVALID
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const editStatusAppointmentValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: APPOINTMENT_MESSAGES.USER_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: APPOINTMENT_MESSAGES.USER_ID_MUST_BE_A_UUID
      }
    },
    status: {
      in: ['body'],
      notEmpty: {
        errorMessage: APPOINTMENT_MESSAGES.STATUS_IS_REQUIRED
      },
      custom: {
        options: async (values) => {
          const statusList = Object.values(TestServiceBookingStatus)
          if (!statusList.includes(values)) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: APPOINTMENT_MESSAGES.STATUS_IS_INVALID
            })
          }
        }
      }
    }
  })
)
