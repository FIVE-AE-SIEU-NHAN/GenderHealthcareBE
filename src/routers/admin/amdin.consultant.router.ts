import express from 'express'
import { getConsultantController } from '~/controllers/admin/admin.users.controller'
import { getConsultantValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const adminConsultantRouter = express.Router()

adminConsultantRouter.get(
  '/get-consultant',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  getConsultantValidator,
  wrapAsync(getConsultantController)
)
export default adminConsultantRouter
