import express from 'express'
import { cancelPaymentController } from '~/controllers/payment.controllers'
import { wrapAsync } from '~/utils/handler'

const paymentRoute = express.Router()

/**
 * Description: Cancel payment.
 * Path: /payment/cancel
 * Method: POST
 */
paymentRoute.post('/cancel', wrapAsync(cancelPaymentController))

/**
 * Description: Webhook for PayOS payment status updates.
 * Path: /payment/webhook
 * Method: POST
 */
paymentRoute.post('/webhook', (req, res) => {
  // This route is for PayOS to send payment status updates.
  // You can implement the logic to handle the webhook here.
  res.status(200).send('Webhook received')
})

export default paymentRoute
