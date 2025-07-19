import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  bookTestServiceAppointmentController,
  getTestServicePacketController
} from '~/controllers/testServices.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { bookTestServiceAppointmentValidator } from '~/middlewares/testServices.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const testServiceRouter = express.Router()

/**
 * Description: Get test service packages
 * Path: /test-service/packages
 */
testServiceRouter.get('/packages', accessTokenValidator, wrapAsync(getTestServicePacketController))

/**
 * Description: Book a test service package
 * Path: /test-service/book
 * Method: POST
 */
testServiceRouter.post(
  '/book',
  accessTokenValidator,
  //   requireRole(USER_ROLE.User),
  bookTestServiceAppointmentValidator,
  wrapAsync(bookTestServiceAppointmentController)
)
export default testServiceRouter
