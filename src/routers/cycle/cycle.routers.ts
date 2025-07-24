import express from 'express';
import { wrapAsync } from '~/utils/handler';
import { accessTokenValidator } from '~/middlewares/user.middlewares';
import {
  createCycleController,
  getCyclePredictions,
  getAllCyclesController,
  getCycleByIdController,
  updateCycleController,
  deleteCycleController,
  getAllCyclesForAdmin,
  getCyclePredictionByUserId
} from '~/controllers/cycle.controllers';
import { createCycleLogController, getCycleLogsController } from '~/controllers/cycleLogs.controllers';
import { cycleValidator } from '~/middlewares/cycle.middlewares';

const cycleRouter = express.Router();

cycleRouter.post('/', accessTokenValidator, cycleValidator, wrapAsync(createCycleController));
cycleRouter.get('/admin/all', accessTokenValidator, wrapAsync(getAllCyclesForAdmin));
cycleRouter.get('/', accessTokenValidator, wrapAsync(getAllCyclesController));
cycleRouter.get('/predict', accessTokenValidator, wrapAsync(getCyclePredictions));
cycleRouter.get('/predict/:user_id', accessTokenValidator, wrapAsync(getCyclePredictionByUserId));
cycleRouter.get('/:id', accessTokenValidator, wrapAsync(getCycleByIdController));
cycleRouter.put('/:id', accessTokenValidator, cycleValidator, wrapAsync(updateCycleController));
cycleRouter.delete('/:id', accessTokenValidator, wrapAsync(deleteCycleController));

// Log routes (new)
cycleRouter.post('/:cycle_id/logs', accessTokenValidator, wrapAsync(createCycleLogController));
cycleRouter.get('/:cycle_id/logs', accessTokenValidator, wrapAsync(getCycleLogsController));

export default cycleRouter;
