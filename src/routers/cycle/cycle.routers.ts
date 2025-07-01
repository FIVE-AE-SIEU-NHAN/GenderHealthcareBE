import express from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { createCycleController, getCyclePredictions } from '~/controllers/cycle.controllers'
import { cycleValidator } from '~/middlewares/cycle.middlewares'

const cycleRouter = express.Router();
cycleRouter.post('/', accessTokenValidator, cycleValidator, wrapAsync(createCycleController))
cycleRouter.get('/predict', accessTokenValidator, wrapAsync(getCyclePredictions))

export default cycleRouter;
