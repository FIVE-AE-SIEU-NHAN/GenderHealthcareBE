
import express from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import {
 
  getAllPredictionsAdminController,
  getCyclePredictionByCycleId
} from '~/controllers/cyclePrediction.controllers'

const predictionRouter = express.Router()


predictionRouter.get('/admin/all', accessTokenValidator, wrapAsync(getAllPredictionsAdminController))
predictionRouter.get('/cycle/:cycleId', accessTokenValidator, wrapAsync(getCyclePredictionByCycleId));
export default predictionRouter;
