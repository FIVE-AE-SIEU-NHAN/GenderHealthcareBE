import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getNotificationsController } from '~/controllers/notification.controllers'
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

export default notificationRouter

// api lấy thông báo - nếu user online thì gửi qua socket và set is_send = true, nếu không online thì thôi
// api lấy 10 thông báo gần nhất (limit, page), số lượng chưa đọc dựa trên is_send = false
