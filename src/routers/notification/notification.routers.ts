import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getNotificationsController, updateNotificationsController } from '~/controllers/notification.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const notificationRouter = express.Router()

/**
 * Description: Get notifications for user
 * Path: notification/get
 * Method: GET
 */
notificationRouter.get('/get', accessTokenValidator, wrapAsync(getNotificationsController))

/**
 * Description: Update notification status to read
 * Path: notification/update
 * Method: PATCH
 */
notificationRouter.patch('/update', accessTokenValidator, wrapAsync(updateNotificationsController))

export default notificationRouter
