import express from 'express'
import {
  bookAppointmentController,
  consultantAppointmentsController,
  customerAppointmentsController
} from '~/controllers/appointment.controllers'
import { bookAppointmentValidator, getAppointmentValidator } from '~/middlewares/appointment.middlewares'
import { wrapAsync } from '~/utils/handler'

const appointmentRouter = express.Router()

/**
 * Description: Book an appointment
 * Path: appointment/book
 * Method: POST
 * Request Body: { topic: Topic, schedule: Date}
 */
appointmentRouter.post('/book', bookAppointmentValidator, wrapAsync(bookAppointmentController))

/**
 * Description: Get appointments for consultant
 * Path: appointment/customer
 * Method: GET
 */
appointmentRouter.get(
  '/consultant',
  // accessTokenValidator,
  // requireRole(USER_ROLE.User),
  getAppointmentValidator,
  wrapAsync(consultantAppointmentsController)
)

/**
 * Description: Get appointments for customer
 * Path: appointment/customer
 * Method: GET
 */
appointmentRouter.get(
  '/customer',
  // accessTokenValidator,
  // requireRole(USER_ROLE.User),
  wrapAsync(customerAppointmentsController)
)

export default appointmentRouter
