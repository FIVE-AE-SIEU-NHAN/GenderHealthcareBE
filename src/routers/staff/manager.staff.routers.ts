import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { editStatusStaffController, getStaffController } from '~/controllers/admin/admin.users.controllers'
import { updateConsultantProfileController, updateStaffProfileController } from '~/controllers/users.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { filterMiddlewares } from '~/middlewares/filter.middlewares'
import {
  accessTokenValidator,
  editStatusStaffValidator,
  getStaffValidator,
  updateConsultantProfileValidator,
  updateStaffProfileValidator
} from '~/middlewares/user.middlewares'
import { UpdateStaffProfileReqBody } from '~/models/requests/users.requests'
import { wrapAsync } from '~/utils/handler'

const managerStaffRouter = express.Router()

/**
 * Description: Get staff information for admin
 * Path: /staff/get-staff
 * Method: GET
 */
managerStaffRouter.get(
  '/get-staff',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager, USER_ROLE.Admin),
  getStaffValidator,
  wrapAsync(getStaffController)
)

/**
 * Description: This router is used for managing staff by the manager.
 * Path: /staff/:id/edit-status
 * Method: PATCH
 * Body: { status: string }
 */
managerStaffRouter.patch(
  '/:id/edit-status',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  editStatusStaffValidator,
  wrapAsync(editStatusStaffController)
)

/**
 * Description: Update profile of a staff by the manager.
 * Path: /staff/:id/update-profile
 * Method: PATCH
 * Body: { name: string, email: string }
 */
managerStaffRouter.patch(
  '/:id/update-profile',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager, USER_ROLE.Admin),
  filterMiddlewares<UpdateStaffProfileReqBody>(['specialization']),
  updateStaffProfileValidator,
  wrapAsync(updateStaffProfileController)
)

export default managerStaffRouter
