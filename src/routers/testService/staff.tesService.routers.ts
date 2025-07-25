import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  getPackageDetailController,
  staffTestServiceAppointmentController,
  updateTestServiceResultController
} from '~/controllers/testServices.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import {
  getPackageDetailValidator,
  getTestServiceAppointmentValidator,
  updateTestServiceResultValidator
} from '~/middlewares/testServices.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const staffTestServiceRouter = express.Router()

/**
 * Description: Get appointments for staff
 * Path: test-service/staff
 * Method: GET
 */
staffTestServiceRouter.get(
  '/staff',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff),
  getTestServiceAppointmentValidator,
  wrapAsync(staffTestServiceAppointmentController)
)

/**
 * Description: Get package details of test service appointments
 * Path: test-service/package/:id
 * Method: GET
 */
staffTestServiceRouter.get(
  '/package/:id',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff),
  getPackageDetailValidator,
  wrapAsync(getPackageDetailController)
)

/**
 * Description: Update test result for staff
 * Path: test-service/:id/result
 * Method: POST
 */
staffTestServiceRouter.post(
  '/:id/result',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff),
  updateTestServiceResultValidator,
  wrapAsync(updateTestServiceResultController)
)
export default staffTestServiceRouter
