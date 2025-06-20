import express from 'express'
import { bookAppointmentController } from '~/controllers/appointment.controllers'
import { bookAppointmentValidator } from '~/middlewares/appointment.middlewares'
import { wrapAsync } from '~/utils/handler'

const appointmentRouter = express.Router()

/**
 * Description: Book an appointment
 * Path: appointment/book
 * Method: POST
 * Request Body: { topic: Topic, schedule: Date}
 */
appointmentRouter.post('/book', bookAppointmentValidator, wrapAsync(bookAppointmentController))

export default appointmentRouter
