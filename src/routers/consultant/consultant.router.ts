import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getConsultantProfileController } from '~/controllers/users.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const consultantRouter = express.Router()

/**
 * Description: Get consultant profile
 * Path: /consultant/profile
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
consultantRouter.get(
  '/profile',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant),
  wrapAsync(getConsultantProfileController)
)

export default consultantRouter
