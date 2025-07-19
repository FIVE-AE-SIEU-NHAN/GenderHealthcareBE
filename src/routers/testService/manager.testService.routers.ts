import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { editStatusTestServiceAppointmentController } from '~/controllers/testServices.controllers'
import { editStatusAppointmentValidator } from '~/middlewares/appointment.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const managerTestServiceRouter = express.Router()

/**
 * Description: Edit test service status
 * Path: test-service/:id/edit-status
 * Method: PATCH
 * Parameters: { id: string }
 * Body: { status: BookingStatus }
 */
managerTestServiceRouter.patch(
  '/:id/edit-status',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff, USER_ROLE.Manager),
  editStatusAppointmentValidator,
  wrapAsync(editStatusTestServiceAppointmentController)
)

export default managerTestServiceRouter
