import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getConsultantProfileController, getStaffProfileController } from '~/controllers/users.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const staffRouter = express.Router()

/**
 * Description: Get consultant profile
 * Path: /staff/profile
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
staffRouter.get('/profile', accessTokenValidator, requireRole(USER_ROLE.Staff), wrapAsync(getStaffProfileController))

export default staffRouter
