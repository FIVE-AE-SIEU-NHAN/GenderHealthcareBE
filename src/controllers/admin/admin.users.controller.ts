import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  CreateUserReqBody,
  EditReqQuery,
  EditStatusUserReqBody,
  GetUserReqQuery
} from '~/models/requests/users.requests'
import usersServices from '~/services/users.services'

export const getUsersController = async (
  req: Request<ParamsDictionary, any, any, GetUserReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersServices.getUsersForAdmin(req.query)

  res.status(200).json({
    message: USERS_MESSAGES.GET_USERS_FOR_ADMIN_SUCCESSFULLY,
    result
  })
}

export const editStatusUserController = async (
  req: Request<ParamsDictionary, any, EditStatusUserReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { status } = req.body

  await usersServices.editStatusUser(id, status)

  res.status(200).json({
    message: USERS_MESSAGES.USER_STATUS_UPDATED_SUCCESSFULLY
  })
}

export const createUserController = async (
  req: Request<ParamsDictionary, any, CreateUserReqBody>,
  res: Response,
  next: NextFunction
) => {
  const checkResult = await usersServices.checkEmailExist(req.body.email)

  // Chưa có tài khoản
  if (!checkResult || !checkResult.haveAccount) {
    const result = await usersServices.createUser(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: USERS_MESSAGES.CREATE_USER_SUCCESSFULLTY,
      result
    })
    return
  }

  // Đã có tài khoản đăng nhập bằng google
  const { havePassword } = checkResult
  if (!havePassword) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: USERS_MESSAGES.USER_HAVE_ACCOUNT_WITH_GOOGLE
    })
  }

  // Đã có tài khoản và đã có password
  throw new ErrorWithStatus({
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
  })
}
