import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { editStatusConsultantController } from '~/controllers/admin/admin.users.controller'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { editStatusConsultantValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const managerConsultantRouter = express.Router()

managerConsultantRouter.patch(
  '/:id/edit-status',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Consultant),
  editStatusConsultantValidator,
  wrapAsync(editStatusConsultantController)
)

export default managerConsultantRouter
