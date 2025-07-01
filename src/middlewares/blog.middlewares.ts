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
      _status: {
        optional: true,
        custom: {
          options: async (value) => {
            value = Array.isArray(value) ? value : [value]
            const blogList = Object.values(BlogStatus)
            if (!value.every((blog: string) => blogList.includes(blog as BlogStatus))) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: BLOG_MESSAGES.STATUS_IS_INVALID
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

export const editStatusBlogValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: BLOG_MESSAGES.BLOG_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: BLOG_MESSAGES.BLOG_ID_MUST_BE_A_UUID
      }
    },
    status: {
      in: ['body'],
      custom: {
        options: async (value) => {
          const blogList = Object.values(BlogStatus)
          if (!blogList.includes(value as BlogStatus)) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: BLOG_MESSAGES.STATUS_IS_INVALID
            })
          }
          return true
        }
      }
    }
  })
)

export const createBlogsValidator = validate(
  checkSchema(
    {
      title: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.TITLE_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 255 },
          errorMessage: BLOG_MESSAGES.TITLE_LENGTH_MUST_BE_BETWEEN_1_AND_255
        },
        trim: true
      },
      summary: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.SUMMARY_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.SUMMARY_MUST_BE_A_STRING
        },
        trim: true
      },
      content: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.CONTENT_MUST_BE_A_STRING
        },
        trim: true
      },
      section_1: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.SECTION_1_MUST_BE_A_STRING
        },
        trim: true
      },
      section_2: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.SECTION_2_MUST_BE_A_STRING
        },
        trim: true
      },
      cover_image: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.COVER_IMAGE_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: BLOG_MESSAGES.COVER_IMAGE_LENGTH_MUST_BE_LESS_THAN_255
        },
        trim: true
      },
      main_image: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.MAIN_IMAGE_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: BLOG_MESSAGES.MAIN_IMAGE_LENGTH_MUST_BE_LESS_THAN_255
        },
        trim: true
      },
      sub_image: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.SUB_IMAGE_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: BLOG_MESSAGES.SUB_IMAGE_LENGTH_MUST_BE_LESS_THAN_255
        },
        trim: true
      }
    },
    ['body']
  )
)

export const updateBlogsValidator = validate(
  checkSchema(
    {
      title: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.TITLE_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 255 },
          errorMessage: BLOG_MESSAGES.TITLE_LENGTH_MUST_BE_BETWEEN_1_AND_255
        },
        trim: true
      },
      summary: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.SUMMARY_MUST_BE_A_STRING
        },
        trim: true
      },
      content: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.CONTENT_MUST_BE_A_STRING
        },
        trim: true
      },
      section_1: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.SECTION_1_MUST_BE_A_STRING
        },
        trim: true
      },
      section_2: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.SECTION_2_MUST_BE_A_STRING
        },
        trim: true
      },
      cover_image: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.COVER_IMAGE_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: BLOG_MESSAGES.COVER_IMAGE_LENGTH_MUST_BE_LESS_THAN_255
        },
        trim: true
      },
      main_image: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.MAIN_IMAGE_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: BLOG_MESSAGES.MAIN_IMAGE_LENGTH_MUST_BE_LESS_THAN_255
        },
        trim: true
      },
      sub_image: {
        optional: true,
        isString: {
          errorMessage: BLOG_MESSAGES.SUB_IMAGE_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 255 },
          errorMessage: BLOG_MESSAGES.SUB_IMAGE_LENGTH_MUST_BE_LESS_THAN_255
        },
        trim: true
      }
    },
    ['body']
  )
)
