import express from 'express'
import { update, wrap } from 'lodash'
import {
  checkActiveCycleController,
  createCycleController,
  getCyclePredictionsController,
  updateCycleStatusLogsController
} from '~/controllers/cycle.controllers'
import {
  createCycleValidator,
  getCyclePredictionsValidator,
  updateCycleStatusLogsValidator
} from '~/middlewares/cycle.middleware'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const cycleRouter = express.Router()

/**
 * Description: Check user have cycle or not
 * PATH: /cycle/check
 * Method: GET
 */
cycleRouter.get('/check', accessTokenValidator, wrapAsync(checkActiveCycleController))

/**
 * Description: Create a new cycle
 * PATH: /cycle/create
 * Method: POST
 */
cycleRouter.post('/create', accessTokenValidator, createCycleValidator, wrapAsync(createCycleController))

/**
 * Description: Get cycle predictions
 * PATH: /cycle/predictions
 * Method: GET
 */
cycleRouter.get(
  '/predictions',
  accessTokenValidator,
  getCyclePredictionsValidator,
  wrapAsync(getCyclePredictionsController)
)

/**
 * Description: Update cycle status logs
 * PATH: /cycle/status-logs
 * Method: POST
 */
cycleRouter.post(
  '/:id/status-logs',
  accessTokenValidator,
  updateCycleStatusLogsValidator,
  wrapAsync(updateCycleStatusLogsController)
)

export default cycleRouter
