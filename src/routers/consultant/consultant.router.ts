import express from 'express'
import { getConsultantController } from '~/controllers/admin/admin.users.controller'
import { getConsultantValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const consultantRouter = express.Router()

/**
 * Description: Get consultant information for admin
 * Path: /consultant/get-consultant
 * Method: GET
 */
consultantRouter.get(
  '/get-consultant',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  getConsultantValidator,
  wrapAsync(getConsultantController)
)

export default consultantRouter
