import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { USERS_MESSAGES } from '~/constants/messages'
import { EditReqQuery, EditStatusUserReqBody, GetUserReqQuery } from '~/models/requests/users.requests'
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
