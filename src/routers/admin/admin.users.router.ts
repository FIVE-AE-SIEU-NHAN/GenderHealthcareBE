import express from 'express'
import { getUsersController } from '~/controllers/admin/admin.users.controller'
import { getUsersValidator } from '~/middlewares/user.middlewares'
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

export default adminUserRoute
