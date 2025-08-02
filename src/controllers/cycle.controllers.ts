import { CycleLogStatus, CyclePredictionStatus, LogsDateStatus } from '@prisma/client'
import { addDays, addHours, subDays } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { cycleQueue } from '~/queues/queue'
import HTTP_STATUS from '~/constants/httpStatus'
import { CYCLE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  CreateCycleReqBody,
  GetCycleLogsDetailReqBody,
  getCyclePredictionsReqQuery,
  UpdateCycleStatusLogsReqBody
} from '~/models/requests/cycle.request'
import { EditReqQuery, TokenPayLoad } from '~/models/requests/users.requests'
import chatBotServices from '~/services/chatbot.services'
import cycleServices from '~/services/cycle.services'

export const checkActiveCycleController = async (
  req: Request<ParamsDictionary, any, CreateCycleReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

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
  const { user_id } = req.decode_authorization as TokenPayLoad
  const { start_period_date, cycle_length, period_length, is_contraceptive_pill_reminder } = req.body
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

  await cycleServices.generateInitialCycleLogs(cycle_id, {
    period_start: start_period_date_parsed,
    period_end: period_end_date,
    fertile_start: fertile_window_start,
    fertile_end: fertile_window_end
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfCycle = addDays(fertile_window_end, 1)
  endOfCycle.setHours(0, 0, 0, 0)
  const delay = endOfCycle.getTime() - today.getTime()

  cycleQueue.add(
    'set-completed-for-cycle',
    {
      user_id
    },
    {
      delay,
      jobId: result.id,
      removeOnComplete: true
    }
  )

  // Nếu có uống thuoốc tránh thai thì tạo nhắc nhở
  if (is_contraceptive_pill_reminder) {
    // 1. Tạo pillLog cho ngày mai
    await cycleServices.createContraceptivePillReminder(user_id, start_period_date)
    // 2. Tạo 3 job nhắc nhở mỗi ngày
    cycleQueue.add(
      'notification_contraceptive_pill_reminder_8h',
      { user_id },
      {
        repeat: {
          cron: '00 08 * * *',
          tz: 'Asia/Ho_Chi_Minh'
        },
        jobId: `pill-reminder-8h-${user_id}`
      }
    )
    cycleQueue.add(
      'notification_contraceptive_pill_reminder_20h',
      { user_id },
      {
        repeat: {
          cron: '00 20 * * *',
          tz: 'Asia/Ho_Chi_Minh'
        },
        jobId: `pill-reminder-20h-${user_id}`
      }
    )
    cycleQueue.add(
      'notification_contraceptive_pill_reminder_canceled',
      { user_id },
      {
        repeat: {
          cron: '59 23 * * *',
          tz: 'Asia/Ho_Chi_Minh'
        },
        jobId: `pill-reminder-canceled-${user_id}`
      }
    )
  }

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
  const { user_id } = req.decode_authorization as TokenPayLoad

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
    Cycle length (days): ${cycle.cycle_length}

    The user's self-reported values:
    - mood: ${mood}
    - libido: ${libido}
    - stress: ${stress}
    - sleep_hours: ${sleep_hours}
    - energy: ${energy}
  `.trim()

  // Gọi AI service để phân tích chu kỳ
  const aiAnalysis = await chatBotServices.handleMenstrualPredictorAi(message)

  // Tạo nhật ký trạng thái chu kỳ
  const result = await cycleServices.updateCycleStatusLogs(cycle_id, aiAnalysis.status, aiAnalysis.note, req.body)
  await cycleServices.updateLogDateStatus({
    cycle_id,
    log_date: new Date(log_date),
    status: LogsDateStatus.RATED
  })

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.CYCLE_PREDICTIONS_FETCHED_SUCCESSFULLY,
    result
  })
}

export const cancelCycleController = async (
  req: Request<ParamsDictionary, any, any, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  const { id: cycle_id } = req.params

  const job = await cycleQueue.getJob(cycle_id)
  job && (await job.remove())

  const result = await cycleServices.updateCycleStatus(user_id, CyclePredictionStatus.SKIPPED)

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.CYCLE_CANCELED_SUCCESSFULLY,
    result
  })
}

export const getCycleLogsDetailController = async (
  req: Request<ParamsDictionary, any, GetCycleLogsDetailReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id: cycle_id } = req.params
  const result = await cycleServices.getCycleLogsDetail(cycle_id, req.body)

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.GET_CYCLE_LOGS_DETAIL_SUCCESSFULLY,
    result
  })
}

export const takenPillTodayController = async (
  req: Request<ParamsDictionary, any, GetCycleLogsDetailReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  const log_date = addHours(new Date(), 7)

  const result = await cycleServices.takenPillToday(user_id, log_date.toISOString())

  res.status(HTTP_STATUS.OK).json({
    message: CYCLE_MESSAGES.PILL_TAKEN_SUCCESSFULLY,
    result
  })
}
