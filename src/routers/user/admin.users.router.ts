import express from 'express'
import {
  createUserController,
  editStatusUserController,
  getUsersController
} from '~/controllers/admin/admin.users.controller'
import { createUserValidator, editStatusUserValidator, getUsersValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const adminUserRoute = express.Router()

/**
 * Description: Get user.
 * Path: /user/get-users
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
 * Path: /user/:id/edit-status
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
 * Path: /user/create
 * Method: POST
 * Body: { email: string, name: string, phone_number: string, date_of_birth: string, role: string }
 */
adminUserRoute.post(
  '/create',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  createUserValidator,
  wrapAsync(createUserController)
)

export default adminUserRoute
