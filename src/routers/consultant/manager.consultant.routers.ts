import express from 'express'
import { update } from 'lodash'
import { USER_ROLE } from '~/constants/enums'
import { editStatusConsultantController, getConsultantController } from '~/controllers/admin/admin.users.controllers'
import { updateConsultantProfileController } from '~/controllers/users.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { filterMiddlewares } from '~/middlewares/filter.middlewares'
import {
  accessTokenValidator,
  editStatusConsultantValidator,
  getConsultantValidator,
  updateConsultantProfileValidator
} from '~/middlewares/user.middlewares'
import { UpdateConsultantProfileReqBody } from '~/models/requests/users.requests'
import { wrapAsync } from '~/utils/handler'

const managerConsultantRouter = express.Router()

/**
 * Description: Get consultant information for admin
 * Path: /consultant/get-consultant
 * Method: GET
 */
managerConsultantRouter.get(
  '/get-consultant',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager, USER_ROLE.Admin),
  getConsultantValidator,
  wrapAsync(getConsultantController)
)

/**
 * Description: This router is used for managing consultants by the manager.
 * Path: /consultant/:id/edit-status
 * Method: PATCH
 * Body: { status: string }
 */
managerConsultantRouter.patch(
  '/:id/edit-status',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  editStatusConsultantValidator,
  wrapAsync(editStatusConsultantController)
)

/**
 * Description: Update profile of a consultant by the manager.
 * Path: /consultant/:id/update-profile
 * Method: PATCH
 * Body: { name: string, email: string }
 */
managerConsultantRouter.patch(
  '/:id/update-profile',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager, USER_ROLE.Admin),
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
