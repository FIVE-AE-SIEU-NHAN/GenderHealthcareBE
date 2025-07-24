import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { staffTestServiceAppointmentController } from '~/controllers/testServices.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { getTestServiceAppointmentValidator } from '~/middlewares/testServices.middlewares'
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

export default staffTestServiceRouter
