import { BlogStatus } from '@prisma/client'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { BLOG_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { validate } from '~/utils/validation'

export const getBlogsValidator = validate(
  checkSchema(
    {
      _page: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.PAGE_IS_REQUIRED
        },
        isInt: {
          options: { min: 1 },
          errorMessage: BLOG_MESSAGES.PAGE_MUST_BE_A_POSITIVE_INTEGER
        }
      },
      _limit: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.LIMIT_IS_REQUIRED
        },
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: BLOG_MESSAGES.LIMIT_MUST_BE_A_POSITIVE_INTEGER_AND_LESS_THAN_100
        }
      },
      _sort: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = ['author_name', 'title', 'created_at', 'status']
            if (!validOrders.includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: BLOG_MESSAGES.SORT_FIELD_IS_INVALID
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
                message: BLOG_MESSAGES.ORDER_MUST_BE_ASC_OR_DESC
              })
            }
            return true
          }
        }
      },
      _created_at: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: BLOG_MESSAGES.CREATED_AT_BE_ISO8601
        }
      },
      _all: {
        optional: true
      }
    },
    ['query']
  )
)

export const getBlogsDetailValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.BLOG_ID_IS_REQUIRED
        },
        isUUID: {
          errorMessage: BLOG_MESSAGES.BLOG_ID_MUST_BE_A_UUID
        }
      }
    },
    ['params']
  )
)
