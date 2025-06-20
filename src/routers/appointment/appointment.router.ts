import express from 'express'
import { bookAppointmentValidator } from '~/middlewares/appointment.middlewares'

const appointmentRouter = express.Router()

/**
 * Description: Book an appointment
 * Path: appointment/book
 * Method: POST
 * Request Body: { topic: Topic, schedule: Date}
 */
appointmentRouter.post('/book', bookAppointmentValidator, async (req, res) => {
  res.status(200).json({
    message: 'Appointment booked successfully'
  })
})

export default appointmentRouter
