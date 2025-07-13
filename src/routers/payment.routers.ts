import express from 'express'
import { cancelPaymentController, webhookPaymentController } from '~/controllers/payment.controllers'
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
paymentRoute.post('/webhook', wrapAsync(webhookPaymentController))

export default paymentRoute
