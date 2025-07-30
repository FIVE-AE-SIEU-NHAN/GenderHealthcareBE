import express from 'express'
import { update, wrap } from 'lodash'
import {
  cancelCycleController,
  checkActiveCycleController,
  createCycleController,
  getCycleLogsDetailController,
  getCyclePredictionsController,
  takenPillTodayController,
  updateCycleStatusLogsController
} from '~/controllers/cycle.controllers'
import {
  cancelCycleValidator,
  createCycleValidator,
  getCycleLogsDetailValidator,
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

/**
 * Description: Cancel cycle
 * PATH: /cycle/:id/cancel
 * Method: PATCH
 */
cycleRouter.patch('/:id/cancel', accessTokenValidator, cancelCycleValidator, wrapAsync(cancelCycleController))

/**
 * Description: Get log details of a cycle
 * PATH: /cycle/:id/logs-detail
 * Method: POST
 */
cycleRouter.post(
  '/:id/logs-detail',
  // accessTokenValidator,
  getCycleLogsDetailValidator,
  wrapAsync(getCycleLogsDetailController)
)

/**
 * Description: Taken pill today
 * PATH: /cycle/pill/taken
 * Method: POST
 */
cycleRouter.patch('/pill/taken', accessTokenValidator, wrapAsync(takenPillTodayController))

export default cycleRouter
