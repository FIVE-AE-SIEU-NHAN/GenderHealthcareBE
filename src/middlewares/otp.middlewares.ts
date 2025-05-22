import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const getOTPValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      }
    },
    ['body']
  )
)
