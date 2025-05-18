import express from 'express'
import { emailController } from '~/controllers/email.controllers'
const emailRouter = express.Router()

emailRouter.post('/send', emailController)

export default emailRouter
