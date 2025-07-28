import { addDays, subDays } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CYCLE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  CreateCycleReqBody,
  getCyclePredictionsReqQuery,
  UpdateCycleStatusLogsReqBody
} from '~/models/requests/cycle.request'
import { EditReqQuery, TokenPayLoad } from '~/models/requests/users.requests'
import cycleServices from '~/services/cycle.services'

export const checkActiveCycleController = async (
  req: Request<ParamsDictionary, any, CreateCycleReqBody>,
  res: Response,
  next: NextFunction
) => {
  //   const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1fe57d3b-4808-11f0-bfde-0242ac110002'

  const result = await cycleServices.checkActiveCycle(user_id)

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.CYCLE_STATUS_CHECKED_SUCCESSFULLY,
    result
  })
}

export const createCycleController = async (
  req: Request<ParamsDictionary, any, CreateCycleReqBody>,
  res: Response,
  next: NextFunction
) => {
  //   const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1fe57d3b-4808-11f0-bfde-0242ac110002'
  const { start_period_date, cycle_length, period_length, note } = req.body
  const start_period_date_parsed = new Date(start_period_date)

  const cycle = await cycleServices.checkActiveCycle(user_id)
  if (cycle) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.BAD_REQUEST,
      message: CYCLE_MESSAGES.YOU_HAVE_ACTIVE_CYCLE
    })
  }

  const { id: cycle_id } = await cycleServices.createCycle(user_id, req.body)
  const next_period_date = addDays(start_period_date_parsed, cycle_length)
  const period_end_date = addDays(start_period_date_parsed, period_length - 1)
  const ovulation_date = addDays(start_period_date_parsed, cycle_length - 14)
  const fertile_window_start = subDays(ovulation_date, 5)
  const fertile_window_end = addDays(ovulation_date, 1)

  const result = await cycleServices.createCyclePrediction({
    cycle_id,
    next_period_date,
    period_end_date,
    ovulation_date,
    fertile_window_start,
    fertile_window_end
  })

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.CYCLE_CREATED_SUCCESSFULLY,
    result
  })
}

export const getCyclePredictionsController = async (
  req: Request<ParamsDictionary, any, any, getCyclePredictionsReqQuery>,
  res: Response,
  next: NextFunction
) => {
  //   const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1fe57d3b-4808-11f0-bfde-0242ac110002'

  const result = await cycleServices.getCyclePredictions(user_id, req.query)

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.CYCLE_PREDICTIONS_FETCHED_SUCCESSFULLY,
    result
  })
}

export const updateCycleStatusLogsController = async (
  req: Request<ParamsDictionary, any, UpdateCycleStatusLogsReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id: cycle_id } = req.params
  const { user_id } = req.decode_authorization as TokenPayLoad

  // lấy thông tin chu kỳ
  const { cycle, next_period_date, period_end_date, ovulation_date, fertile_window_start, fertile_window_end } =
    await cycleServices.getCurrentCyclePredictions(user_id)
  const { log_date, mood, libido, stress, sleep_hours, energy } = req.body

  const message = `
    Start of last period: ${cycle.start_period_date}
    Expected next period: ${next_period_date}
    Expected period end: ${period_end_date}
    Expected ovulation day: ${ovulation_date}
    Fertile window: ${fertile_window_start} to ${fertile_window_end}
    Today is: ${log_date}
    Cycle day: ${cycle.cycle_length}

    The user's self-reported values:
    - mood: ${mood}
    - libido: ${libido}
    - stress: ${stress}
    - sleep_hours: ${sleep_hours}
    - energy: ${energy}
  `.trim()
  const result = await cycleServices.updateCycleStatusLogs(cycle_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.CYCLE_PREDICTIONS_FETCHED_SUCCESSFULLY
    // result
  })
}
