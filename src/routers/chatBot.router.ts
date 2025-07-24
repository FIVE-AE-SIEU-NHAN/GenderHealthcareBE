import express from 'express'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { USER_ROLE } from '~/constants/enums'
import { wrapAsync } from '~/utils/handler'
import { getChatBotConfigController, updateChatBotConfigController } from '~/controllers/chatBot.controllers'
import { getChatBotConfigValidator, updateChatBotConfigValidator } from '~/middlewares/chatBot.middlewares'

const chatBotRouter = express.Router()

/**
 * Description: Get chatbot configuration
 * PATH: /chatbot/config
 * Method: GET
 */
chatBotRouter.post(
  '/config',
  accessTokenValidator,
  requireRole(USER_ROLE.Admin),
  getChatBotConfigValidator,
  wrapAsync(getChatBotConfigController)
)

/**
 * Description: Update chatbot configuration
 * PATH: /chatbot/config
 * Method: PUT
 */
chatBotRouter.put(
  '/config',
  accessTokenValidator,
  requireRole(USER_ROLE.Admin),
  updateChatBotConfigValidator,
  wrapAsync(updateChatBotConfigController)
)

export default chatBotRouter
