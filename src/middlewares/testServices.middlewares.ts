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

export const getTestServiceAppointmentValidator = validate(
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

export const getPackageDetailValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: APPOINTMENT_MESSAGES.PACKAGE_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: APPOINTMENT_MESSAGES.PACKAGE_ID_MUST_BE_A_UUID
      }
    }
  })
)

export const updateTestServiceResultValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: APPOINTMENT_MESSAGES.PACKAGE_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: APPOINTMENT_MESSAGES.PACKAGE_ID_MUST_BE_A_UUID
      }
    },
    test_service_appointment_id: {
      in: ['body'],
      notEmpty: {
        errorMessage: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_ID_MUST_BE_A_UUID
      }
    },
    result: {
      in: ['body'],
      notEmpty: {
        errorMessage: APPOINTMENT_MESSAGES.RESULT_IS_REQUIRED
      },
      isString: {
        errorMessage: APPOINTMENT_MESSAGES.RESULT_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          max: 100
        },
        errorMessage: APPOINTMENT_MESSAGES.RESULT_LENGTH_MUST_BE_LESS_THAN_100
      }
    },
    unit: {
      in: ['body'],
      optional: true,
      isString: {
        errorMessage: APPOINTMENT_MESSAGES.UNIT_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          max: 10
        },
        errorMessage: APPOINTMENT_MESSAGES.UNIT_LENGTH_MUST_BE_LESS_THAN_10
      }
    },
    test_date: {
      in: ['body'],
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: APPOINTMENT_MESSAGES.TEST_DAY_MUST_BE_ISO8601
      }
    },
    note: {
      in: ['body'],
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
  })
)
