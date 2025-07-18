import express from 'express'
import { getTestServicePacketController } from '~/controllers/testServices.controllers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const testServiceRouter = express.Router()

/**
 * Description: Get test service packages
 * Path: /test-service/packages
 */
testServiceRouter.get('/packages', accessTokenValidator, wrapAsync(getTestServicePacketController))

export default testServiceRouter
