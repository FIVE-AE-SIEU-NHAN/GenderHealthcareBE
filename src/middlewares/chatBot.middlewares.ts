import { AiType, Topic } from '@prisma/client'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { CHATBOT_MESSAGES, QUESTIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const getChatBotConfigValidator = validate(
  checkSchema(
    {
      chatbot_type: {
        notEmpty: {
          errorMessage: CHATBOT_MESSAGES.CHATBOT_TYPE_IS_REQUIRED
        },
        custom: {
          options: async (values) => {
            const aiType = Object.values(AiType)
            if (!aiType.includes(values)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: CHATBOT_MESSAGES.CHATBOT_TYPE_IS_INVALID
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const updateChatBotConfigValidator = validate(
  checkSchema(
    {
      chatbot_type: {
        notEmpty: {
          errorMessage: CHATBOT_MESSAGES.CHATBOT_TYPE_IS_REQUIRED
        },
        custom: {
          options: async (values) => {
            const aiType = Object.values(AiType)
            if (!aiType.includes(values)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: CHATBOT_MESSAGES.CHATBOT_TYPE_IS_INVALID
              })
            }
          }
        }
      },
      gemini_key: {
        optional: true,
        isString: {
          errorMessage: CHATBOT_MESSAGES.GEMINI_KEY_MUST_BE_STRING
        }
      },
      system_instructions: {
        optional: true,
        isString: {
          errorMessage: CHATBOT_MESSAGES.SYSTEM_INSTRUCTIONS_MUST_BE_STRING
        }
      },
      temperature: {
        optional: true,
        isFloat: {
          errorMessage: CHATBOT_MESSAGES.TEMPERATURE_MUST_BE_FLOAT
        },
        custom: {
          options: async (values) => {
            if (values < 0 || values > 1) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: CHATBOT_MESSAGES.TEMPERATURE_IS_OUT_OF_RANGE
              })
            }
          }
        }
      },
      max_output_tokens: {
        optional: true,
        isInt: {
          errorMessage: CHATBOT_MESSAGES.MAX_OUTPUT_TOKENS_MUST_BE_INTEGER
        }
      }
    },
    ['body']
  )
)
