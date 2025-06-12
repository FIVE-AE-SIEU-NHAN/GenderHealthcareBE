import { Topic } from '@prisma/client'
import { checkSchema } from 'express-validator'
import _ from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const askQuestionValidator = validate(
  checkSchema(
    {
      topic: {
        notEmpty: {
          errorMessage: QUESTIONS_MESSAGES.TOPIC_IS_REQUIRED
        },
        custom: {
          options: async (values) => {
            const topicList = Object.values(Topic)
            if (!topicList.includes(values)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: QUESTIONS_MESSAGES.TOPIC_IS_INVALID
              })
            }
          }
        }
      },
      question: {
        notEmpty: {
          errorMessage: QUESTIONS_MESSAGES.QUESTION_IS_REQUIRED
        },
        isString: {
          errorMessage: QUESTIONS_MESSAGES.QUESTION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 20,
            max: 1000
          },
          errorMessage: QUESTIONS_MESSAGES.QUESTION_LENGTH_MUST_BE_FROM_20_TO_1000
        }
      }
    },
    ['body']
  )
)

export const getQuestionValidator = validate(
  checkSchema(
    {
      _page: {
        notEmpty: {
          errorMessage: QUESTIONS_MESSAGES.PAGE_IS_REQUIRED
        },
        isInt: {
          options: { min: 1 },
          errorMessage: QUESTIONS_MESSAGES.PAGE_MUST_BE_A_POSITIVE_INTEGER
        }
      },
      _limit: {
        notEmpty: {
          errorMessage: QUESTIONS_MESSAGES.LIMIT_IS_REQUIRED
        },
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: QUESTIONS_MESSAGES.LIMIT_MUST_BE_A_POSITIVE_INTEGER_AND_LESS_THAN_100
        }
      },
      _sort: {
        optional: true
      },
      _order: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['asc', 'desc']
            if (!validOrders.includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: QUESTIONS_MESSAGES.ORDER_MUST_BE_ASC_OR_DESC
              })
            }
            return true
          }
        }
      },
      _topic: {
        optional: true,
        custom: {
          options: async (values) => {
            const topicList = Object.values(Topic)
            if (!topicList.includes(values)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: QUESTIONS_MESSAGES.TOPIC_IS_INVALID
              })
            }
          }
        }
      },
      _answer: {
        optional: true,
        custom: {
          options: (value) => {
            const validAnswers = ['have', 'notyet']
            if (!validAnswers.includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: QUESTIONS_MESSAGES.ANSWER_MUST_BE_HAVE_OR_NOTYET
              })
            }
            return true
          }
        }
      },
      _all: {
        optional: true
      }
    },
    ['query']
  )
)

export const answerQuestionValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: QUESTIONS_MESSAGES.QUESTION_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: QUESTIONS_MESSAGES.ID_MUST_BE_UUID
      }
    },

    answer: {
      in: ['body'],
      notEmpty: {
        errorMessage: QUESTIONS_MESSAGES.ANSWER_IS_REQUIRED
      },
      isString: {
        errorMessage: QUESTIONS_MESSAGES.ANSWER_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 20,
          max: 1000
        },
        errorMessage: QUESTIONS_MESSAGES.ANSWER_LENGTH_MUST_BE_FROM_20_TO_1000
      }
    }
  })
)
