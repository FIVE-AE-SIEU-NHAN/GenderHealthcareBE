import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  bookAppointmentController,
  consultantAppointmentsController,
  customerAppointmentsController,
  editStatusAppointmentController,
  managerAppointmentsController
} from '~/controllers/appointment.controllers'
import {
  bookAppointmentValidator,
  editStatusAppointmentValidator,
  getAppointmentValidator
} from '~/middlewares/appointment.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const appointmentRouter = express.Router()

/**
 * Description: Book an appointment
 * Path: appointment/book
 * Method: POST
 * Request Body: { topic: Topic, schedule: Date}
 */
appointmentRouter.post(
  '/book',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  bookAppointmentValidator,
  wrapAsync(bookAppointmentController)
)

/**
 * Description: Get appointments for customer
 * Path: appointment/customer
 * Method: GET
 */
appointmentRouter.get(
  '/customer',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  wrapAsync(customerAppointmentsController)
)

/**
 * Description: Get appointments for consultant
 * Path: appointment/consultant
 * Method: GET
 */
appointmentRouter.get(
  '/consultant',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant),
  getAppointmentValidator,
  wrapAsync(consultantAppointmentsController)
)

/**
 * Description: Get appointments for manager
 * Path: appointment/manager
 * Method: GET
 */
appointmentRouter.get(
  '/manager',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  getAppointmentValidator,
  wrapAsync(managerAppointmentsController)
)

/**
 * Description: Edit appointment status
 * Path: appointment/:id/edit-status
 * Method: PATCH
 * Parameters: { id: string }
 * Body: { status: BookingStatus }
 */
appointmentRouter.patch(
  '/:id/edit-status',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant, USER_ROLE.Manager),
  editStatusAppointmentValidator,
  wrapAsync(editStatusAppointmentController)
)

export default appointmentRouter

// customer: book appointment, get our appointments, notification, chatroom, video call
// consultant: get appointments, edit status appointment, notification, chatroom, video call
// manager: get appointments, edit status appointment
