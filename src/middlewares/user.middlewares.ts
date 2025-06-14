import { Request, Response, NextFunction } from 'express'
import { body, checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, upperCase } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import redisUtils from '~/utils/redis'
import { verifyGoogleToken } from '~/utils/google'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'
import { Topic } from '@prisma/client'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
  }
}

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
  },
  custom: {
    options: async (value, { req }) => {
      try {
        const decode_forgot_password_token = await verifyToken({
          token: value,
          privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const result = await redisUtils.verifyForgotPasswordToken(decode_forgot_password_token.user_id, value)
        if (!result) {
          throw new Error(USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID)
        }
        ;(req as Request).decode_forgot_password_token = decode_forgot_password_token
      } catch (error) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: (error as JsonWebTokenError).message
        })
      }
      return true
    }
  }
}

export const loginValidator = validate(
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
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const loginGoogleValidator = validate(
  checkSchema(
    {
      id_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ID_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.ID_TOKEN_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const payload = await verifyGoogleToken(value)
            if (!payload) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.ID_TOKEN_IS_INVALID
              })
            }

            ;(req as Request).decode_google_verify_token = payload
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      },
      gender: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.GENDER_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.GENDER_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            // Kiểm tra giá trị gender hợp lệ (male, female, other)
            const validGenders = ['male', 'female', 'other']
            if (!validGenders.includes(value.toLowerCase())) {
              throw new Error(USERS_MESSAGES.GENDER_IS_INVALID)
            }
            return true
          }
        }
      },
      phone_number: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PHONE_NUMBER_MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
            if (!phoneRegex.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_INVALID)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema,
      email_verify_token: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        // Trong phần email_verify_token
        custom: {
          options: async (value: string, { req }) => {
            const email = req.body.email

            // Kiểm tra OTP
            const result = await redisUtils.verifyOTP(email, value)
            if (!result) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const logoutValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (values, { req }) => {
            try {
              const decode_refresh_token = await verifyToken({
                token: values,
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              if (upperCase((error as JsonWebTokenError).message) === 'JWT EXPIRED') {
                return true
              }
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

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

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]

            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decode_authorization = decode_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (values, { req }) => {
            try {
              const decode_refresh_token = await verifyToken({
                token: values,
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              console.log((error as JsonWebTokenError).message)
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
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

export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: passwordSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const updateProfileValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        ...nameSchema
      },
      date_of_birth: {
        optional: true,
        ...dateOfBirthSchema
      },
      gender: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.GENDER_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            // Kiểm tra giá trị gender hợp lệ (male, female, other)
            const validGenders = ['male', 'female', 'other']
            if (!validGenders.includes(value.toLowerCase())) {
              throw new Error(USERS_MESSAGES.GENDER_IS_INVALID)
            }
            return true
          }
        }
      },
      phone_number: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.PHONE_NUMBER_MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
            if (!phoneRegex.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getUsersValidator = validate(
  checkSchema(
    {
      _page: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PAGE_IS_REQUIRED
        },
        isInt: {
          options: { min: 1 },
          errorMessage: USERS_MESSAGES.PAGE_MUST_BE_A_POSITIVE_INTEGER
        }
      },
      _limit: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.LIMIT_IS_REQUIRED
        },
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.LIMIT_MUST_BE_A_POSITIVE_INTEGER_AND_LESS_THAN_100
        }
      },
      _sort: {
        optional: true,
        custom: {
          options: (value) => {
            const validOrders = [
              'id',
              'name',
              'password',
              'role',
              'gender',
              'phone_number',
              'google_id',
              'verify',
              'verify'
            ]
            if (!validOrders.includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: USERS_MESSAGES.SORT_FIELD_IS_INVALID
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
                message: USERS_MESSAGES.ORDER_MUST_BE_ASC_OR_DESC
              })
            }
            return true
          }
        }
      },
      _verify: {
        optional: true,
        custom: {
          options: async (values) => {
            const verifyList = [UserVerifyStatus.Verified, UserVerifyStatus.Banned]
            if (!verifyList.includes(parseInt(values))) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: USERS_MESSAGES.STATUS_IS_INVALID
              })
            }
          }
        }
      },
      _role: {
        optional: true,
        custom: {
          options: (value) => {
            const validRoles = [USER_ROLE.Admin, USER_ROLE.Consultant, USER_ROLE.Staff, USER_ROLE.User]
            if (!validRoles.includes(parseInt(value))) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: USERS_MESSAGES.ROLE_IS_INVALID
              })
            }
            return true
          }
        }
      },
      _gender: {
        optional: true,
        custom: {
          options: (value) => {
            const validGenders = ['male', 'female', 'other']
            if (!validGenders.includes(value.toLowerCase())) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: USERS_MESSAGES.GENDER_IS_INVALID
              })
            }
            return true
          }
        }
      },
      _date_of_birth: {
        optional: true,
        isDate: {
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_DATE
        }
      },
      _all: {
        optional: true
      }
    },
    ['query']
  )
)

export const editStatusUserValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: USERS_MESSAGES.USER_ID_IS_REQUIRED
      },
      isUUID: {
        errorMessage: USERS_MESSAGES.USER_ID_MUST_BE_A_UUID
      }
    },
    status: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.STATUS_IS_REQUIRED
      },
      custom: {
        options: async (values) => {
          const verifyList = [UserVerifyStatus.Verified, UserVerifyStatus.Banned]
          if (!verifyList.includes(parseInt(values))) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: USERS_MESSAGES.STATUS_IS_INVALID
            })
          }
        }
      }
    }
  })
)

export const createValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      },
      gender: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.GENDER_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.GENDER_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            const validGenders = ['male', 'female', 'other']
            if (!validGenders.includes(value.toLowerCase())) {
              throw new Error(USERS_MESSAGES.GENDER_IS_INVALID)
            }
            return true
          }
        }
      },
      phone_number: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PHONE_NUMBER_MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: (value) => {
            const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
            if (!phoneRegex.test(value)) {
              throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_INVALID)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      date_of_birth: dateOfBirthSchema,
      role: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ROLE_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            const validRoles = [USER_ROLE.Admin, USER_ROLE.Consultant, USER_ROLE.Staff, USER_ROLE.User]
            if (!validRoles.includes(value)) {
              throw new Error(USERS_MESSAGES.ROLE_IS_INVALID)
            }
            return true
          }
        }
      },
      specialization_1: {
        custom: {
          options: (value, { req }) => {
            const role = req.body.role
            if (role === USER_ROLE.Consultant) {
              if (!value) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.SPECIALIZATION_1_IS_REQUIRED
                })
              }

              const topicList = Object.values(Topic)
              if (!topicList.includes(value)) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.SPECIALIZATION_1_IS_INVALID
                })
              }
            }
            return true
          }
        }
      },
      specialization_2: {
        custom: {
          options: (value, { req }) => {
            if (typeof value === 'undefined') {
              delete req.body.specialization_2
              return true
            }

            const { role, specialization_1 } = req.body
            if (role === USER_ROLE.Consultant) {
              const topicList = Object.values(Topic)
              if (!topicList.includes(value)) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.SPECIALIZATION_2_IS_INVALID
                })
              }

              if (value === specialization_1) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.SPECIALIZATION_2_IS_THE_SAME_AS_SPECIALIZATION_1
                })
              }
            }
            return true
          }
        }
      },
      certifications: {
        custom: {
          options: (value, { req }) => {
            const role = req.body.role
            if (role === USER_ROLE.Consultant) {
              if (!value) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.CERTIFICATIONS_IS_REQUIRED
                })
              }

              if (typeof value !== 'string') {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.CERTIFICATIONS_MUST_BE_A_STRING
                })
              }
            }
            return true
          }
        }
      },
      experienceYears: {
        custom: {
          options: (value, { req }) => {
            const role = req.body.role
            if (role === USER_ROLE.Consultant) {
              if (!value) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.EXPERIENCE_YEARS_IS_REQUIRED
                })
              }

              if (typeof value !== 'number' || value < 0) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: USERS_MESSAGES.EXPERIENCE_YEARS_MUST_BE_A_POSITIVE_NUMBER
                })
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
