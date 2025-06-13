import express from 'express'
import { editStatusUserController, getUsersController } from '~/controllers/admin/admin.users.controller'
import { editStatusUserValidator, getUsersValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const adminUserRoute = express.Router()

/**
 * Description: Get user.
 * Path: /admin/user/
 * Method: GET
 * Parameters: { page: number, limit: number }
 */
adminUserRoute.get(
  '/get-users',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  getUsersValidator,
  wrapAsync(getUsersController)
)

/**
 * Description: Edit status user.
 * Path: /admin/:id/edit-status
 * Method: PATCH
 * Parameters: { id: string }
 * Body: { status: string }
 */
adminUserRoute.patch(
  '/:id/edit-status',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  editStatusUserValidator,
  wrapAsync(editStatusUserController)
)
/**
 * Description: Create user.
 * Path: /admin/user/
 * Method: POST
 * Body: { email: string, name: string, phone_number: string, date_of_birth: string, role: string }
 */
// adminUserRoute.post(
//   '/user',
//   // accessTokenValidator,
//   // requireRole(USER_ROLE.Admin),
//   wrapAsync(createUserController)
// )

export default adminUserRoute
