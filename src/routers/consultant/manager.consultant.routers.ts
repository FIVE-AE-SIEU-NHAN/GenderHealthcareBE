import express from 'express'
import { update } from 'lodash'
import { USER_ROLE } from '~/constants/enums'
import { editStatusConsultantController } from '~/controllers/admin/admin.users.controller'
import { updateConsultantProfileController } from '~/controllers/users.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { filterMiddlewares } from '~/middlewares/filter.middlewares'
import { editStatusConsultantValidator, updateConsultantProfileValidator } from '~/middlewares/user.middlewares'
import { UpdateConsultantProfileReqBody } from '~/models/requests/users.requests'
import { wrapAsync } from '~/utils/handler'

const managerConsultantRouter = express.Router()

/**
 * Description: This router is used for managing consultants by the manager.
 * Path: /consultant/:id/edit-status
 * Method: PATCH
 * Body: { status: string }
 */
managerConsultantRouter.patch(
  '/:id/edit-status',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Consultant),
  editStatusConsultantValidator,
  wrapAsync(editStatusConsultantController)
)

/**
 * Description: Update profile of a consultant by the manager.
 * Path: /consultant/profile
 * Method: PATCH
 * Body: { name: string, email: string }
 */
managerConsultantRouter.patch(
  '/profile',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Consultant),
  filterMiddlewares<UpdateConsultantProfileReqBody>([
    'specialization_1',
    'specialization_2',
    'certifications',
    'experienceYears'
  ]),
  updateConsultantProfileValidator,
  wrapAsync(updateConsultantProfileController)
)

export default managerConsultantRouter
