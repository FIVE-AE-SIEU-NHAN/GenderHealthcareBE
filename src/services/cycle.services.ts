import { CycleLogStatus } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { CYCLE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  CreateCycleReqBody,
  getCyclePredictionsReqQuery,
  UpdateCycleStatusLogsReqBody
} from '~/models/requests/cycle.request'
import CyclePredictionRepository from '~/repositories/cyclePrediction.repository'
import CycleStatusLogsRepository from '~/repositories/cycleStatusLogs.repository'
import ReproductiveCycleRepository from '~/repositories/reproductiveCycle.repository'

class CycleServices {
  private reproductiveCycleRepository: ReproductiveCycleRepository
  private cyclePredictionRepository: CyclePredictionRepository
  private cycleStatusLogsRepository: CycleStatusLogsRepository

  constructor() {
    this.reproductiveCycleRepository = new ReproductiveCycleRepository()
    this.cyclePredictionRepository = new CyclePredictionRepository()
    this.cycleStatusLogsRepository = new CycleStatusLogsRepository()
  }

  async checkActiveCycle(user_id: string) {
    const result = await this.cyclePredictionRepository.checkActiveCycle(user_id)
    return result.length > 0 ? true : false
  }

  async createCycle(user_id: string, payload: CreateCycleReqBody) {
    const { start_period_date, cycle_length, period_length, note } = payload

    return await this.reproductiveCycleRepository.createCycle({
      user_id,
      start_period_date: new Date(start_period_date),
      cycle_length,
      period_length,
      note
    })
  }

  async createCyclePrediction(data: {
    cycle_id: string
    next_period_date: Date
    period_end_date: Date
    ovulation_date: Date
    fertile_window_start: Date
    fertile_window_end: Date
  }) {
    const { cycle_id, next_period_date, period_end_date, ovulation_date, fertile_window_start, fertile_window_end } =
      data
    return this.cyclePredictionRepository.createCyclePrediction({
      cycle_id,
      next_period_date,
      period_end_date,
      ovulation_date,
      fertile_window_start,
      fertile_window_end
    })
  }

  async getCyclePredictions(user_id: string, payload: getCyclePredictionsReqQuery) {
    const { _start_date, _end_date } = payload
    const predictions = await this.cyclePredictionRepository.getCyclePredictionsByUserId({
      user_id,
      start_date: new Date(_start_date),
      end_date: new Date(_end_date)
    })
    return {
      predictions,
      total: predictions.length
    }
  }

  async getCurrentCyclePredictions(user_id: string) {
    const cycle = await this.cyclePredictionRepository.getCurrentCyclePredictions(user_id)
    if (!cycle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CYCLE_MESSAGES.CYCLE_NOT_FOUND
      })
    }
    return cycle
  }

  async updateCycleStatusLogs(
    cycle_id: string,
    status: CycleLogStatus,
    note: string,
    payload: UpdateCycleStatusLogsReqBody
  ) {
    const { log_date, mood, libido, stress, energy, sleep_hours } = payload

    return await this.cycleStatusLogsRepository.createCycleStatusLogs({
      cycle_id,
      log_date: new Date(log_date),
      mood,
      libido,
      stress,
      energy,
      sleep_hours,
      note,
      status
    })
  }
}

const cycleServices = new CycleServices()
export default cycleServices
