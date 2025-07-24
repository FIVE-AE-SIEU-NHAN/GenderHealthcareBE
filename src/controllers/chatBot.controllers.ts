import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { result } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { CHATBOT_MESSAGES } from '~/constants/messages'
import { GetChatBotConfigReqBody, UpdateChatBotConfigReqBody } from '~/models/requests/chatbot.request'
import chatBotServices from '~/services/chatbot.services'

export const getChatBotConfigController = async (
  req: Request<ParamsDictionary, any, GetChatBotConfigReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { chatbot_type } = req.body

  const result = await chatBotServices.getChatBotConfig(chatbot_type)

  res.status(HTTP_STATUS.OK).json({
    message: CHATBOT_MESSAGES.GET_CHATBOT_CONFIG_SUCCESS,
    result
  })
}

export const updateChatBotConfigController = async (
  req: Request<ParamsDictionary, any, UpdateChatBotConfigReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await chatBotServices.updateChatBotConfig(req.body)

  res.status(HTTP_STATUS.OK).json({
    message: CHATBOT_MESSAGES.UPDATE_CHATBOT_CONFIG_SUCCESS,
    result
  })
}
