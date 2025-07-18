import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { TokenPayLoad } from '~/models/requests/users.requests'
import notificationServices from '~/services/notification.services'

export const getNotificationsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

  const result = await notificationServices.getNotifications(user_id)

  res.status(HTTP_STATUS.OK).json({
    message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_SUCCESS,
    result
  })
}

export const updateNotificationsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  await notificationServices.updateNotifications(user_id)

  res.status(HTTP_STATUS.OK).json({
    message: NOTIFICATIONS_MESSAGES.UPDATE_NOTIFICATIONS_SUCCESS
  })
}
