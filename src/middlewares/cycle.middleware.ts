import { checkSchema } from 'express-validator'
import { CYCLE_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const createCycleValidator = validate(
  checkSchema(
    {
      start_period_date: {
        notEmpty: {
          errorMessage: CYCLE_MESSAGES.START_PERIOD_DATE_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: CYCLE_MESSAGES.START_PERIOD_DATE_MUST_BE_ISO8601
        }
      },
      cycle_length: {
        notEmpty: {
          errorMessage: CYCLE_MESSAGES.CYCLE_LENGTH_IS_REQUIRED
        },
        isInt: {
          options: { min: 20, max: 31 },
          errorMessage: CYCLE_MESSAGES.CYCLE_LENGTH_FROM_20_TO_31
        }
      },
      period_length: {
        notEmpty: {
          errorMessage: CYCLE_MESSAGES.PERIOD_LENGTH_IS_REQUIRED
        },
        isInt: {
          options: { min: 1, max: 10 },
          errorMessage: CYCLE_MESSAGES.PERIOD_LENGTH_FROM_1_TO_10
        }
      },
      note: {
        optional: true,
        isString: {
          errorMessage: CYCLE_MESSAGES.NOTE_MUST_BE_STRING
        },
        isLength: {
          options: {
            max: 500
          },
          errorMessage: CYCLE_MESSAGES.NOTE_MUST_BE_LENGTH
        }
      }
    },
    ['body']
  )
)

export const getCyclePredictionsValidator = validate(
  checkSchema(
    {
      _start_date: {
        notEmpty: {
          errorMessage: CYCLE_MESSAGES.START_DATE_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: CYCLE_MESSAGES.START_DATE_MUST_BE_ISO8601
        }
      },
      _end_date: {
        notEmpty: {
          errorMessage: CYCLE_MESSAGES.END_DATE_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: CYCLE_MESSAGES.END_DATE_MUST_BE_ISO8601
        }
      }
    },
    ['query']
  )
)

export const updateCycleStatusLogsValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.CYCLE_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: CYCLE_MESSAGES.CYCLE_MUST_BE_UUID
      }
    },
    log_date: {
      in: ['body'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.LOG_DATE_IS_REQUIRED
      },
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: CYCLE_MESSAGES.LOG_DATE_MUST_BE_ISO8601
      }
    },
    mood: {
      in: ['body'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.MOOD_IS_REQUIRED
      },
      isInt: {
        options: { min: 1, max: 5 },
        errorMessage: CYCLE_MESSAGES.MOOD_FROM_1_TO_5
      }
    },
    libido: {
      in: ['body'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.LIBIDO_IS_REQUIRED
      },
      isInt: {
        options: { min: 1, max: 5 },
        errorMessage: CYCLE_MESSAGES.LIBIDO_FROM_1_TO_5
      }
    },
    stress: {
      in: ['body'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.STRESS_IS_REQUIRED
      },
      isInt: {
        options: { min: 1, max: 5 },
        errorMessage: CYCLE_MESSAGES.STRESS_FROM_1_TO_5
      }
    },
    energy: {
      in: ['body'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.ENERGY_IS_REQUIRED
      },
      isInt: {
        options: { min: 1, max: 5 },
        errorMessage: CYCLE_MESSAGES.ENERGY_FROM_1_TO_5
      }
    },
    sleep_hours: {
      in: ['body'],
      notEmpty: {
        errorMessage: CYCLE_MESSAGES.SLEEP_HOURS_IS_REQUIRED
      },
      isInt: {
        options: { min: 1, max: 18 },
        errorMessage: CYCLE_MESSAGES.SLEEP_HOURS_FROM_1_TO_18
      }
    }
  })
)
