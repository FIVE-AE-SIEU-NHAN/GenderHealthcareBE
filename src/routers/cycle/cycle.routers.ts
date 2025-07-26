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
  getCyclePredictionByUserId, 

} from '~/controllers/cycle.controllers';
import { createCycleLogController, getCycleLogsController } from '~/controllers/cycleLogs.controllers';
import { cycleValidator } from '~/middlewares/cycle.middlewares';
import { upsertCycleLogController, getLogsByCycleIdController, getLogByCycleIdAndDateController } from '~/controllers/cycleLogs.controllers';

const cycleRouter = express.Router();

cycleRouter.post('/', accessTokenValidator, cycleValidator, wrapAsync(createCycleController));
cycleRouter.get('/admin/all', accessTokenValidator, wrapAsync(getAllCyclesForAdmin));
cycleRouter.get('/', accessTokenValidator, wrapAsync(getAllCyclesController));
cycleRouter.get('/predict', accessTokenValidator, wrapAsync(getCyclePredictions));

cycleRouter.get('/predict/:user_id', accessTokenValidator, wrapAsync(getCyclePredictionByUserId));

cycleRouter.get('/:id', accessTokenValidator, wrapAsync(getCycleByIdController));
cycleRouter.put('/:id', accessTokenValidator, cycleValidator, wrapAsync(updateCycleController));
cycleRouter.delete('/:id', accessTokenValidator, wrapAsync(deleteCycleController));




cycleRouter.post('/:cycle_id/logs', accessTokenValidator, wrapAsync(upsertCycleLogController))
cycleRouter.get('/:cycle_id/logs', accessTokenValidator, wrapAsync(getLogsByCycleIdController))
cycleRouter.get('/:cycle_id/logs/:log_date', accessTokenValidator, wrapAsync(getLogByCycleIdAndDateController))

export default cycleRouter;
