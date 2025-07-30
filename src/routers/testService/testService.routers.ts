import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  bookTestServiceAppointmentController,
  customerTestServiceAppointmentsController,
  getPackageDetailController,
  getTestServicePackagesController,
  getTestServiceResultController
} from '~/controllers/testServices.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { bookTestServiceAppointmentValidator, getPackageDetailValidator } from '~/middlewares/testServices.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const testServiceRouter = express.Router()

/**
 * Description: Get test service packages
 * Path: /test-service/packages
 */
testServiceRouter.get('/packages', accessTokenValidator, wrapAsync(getTestServicePackagesController))

/**
 * Description: Book a test service package
 * Path: /test-service/book
 * Method: POST
 */
testServiceRouter.post(
  '/book',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  bookTestServiceAppointmentValidator,
  wrapAsync(bookTestServiceAppointmentController)
)

/**
 * Description: Get test-service for customer
 * Path: test-service/customer
 * Method: GET
 */
testServiceRouter.get(
  '/customer',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  wrapAsync(customerTestServiceAppointmentsController)
)

/**
 * Description: Get test service result
 * Path: /test-service/result/:id
 * Method: GET
 */
testServiceRouter.get(
  '/result/:id',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  getPackageDetailValidator,
  wrapAsync(getTestServiceResultController)
)

export default testServiceRouter
