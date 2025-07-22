
import express from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import {
  createPredictionController,
  getPredictionsByUserController,
  getAllPredictionsAdminController,
  getCyclePredictionByCycleId
} from '~/controllers/cyclePrediction.controllers'

const predictionRouter = express.Router()

predictionRouter.post('/', accessTokenValidator, wrapAsync(createPredictionController))
predictionRouter.get('/me', accessTokenValidator, wrapAsync(getPredictionsByUserController))
predictionRouter.get('/admin/all', accessTokenValidator, wrapAsync(getAllPredictionsAdminController))
predictionRouter.get('/cycle/:cycleId', accessTokenValidator, wrapAsync(getCyclePredictionByCycleId));
export default predictionRouter;
