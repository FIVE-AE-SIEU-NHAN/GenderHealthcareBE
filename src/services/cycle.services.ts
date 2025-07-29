import { CycleLogStatus, CyclePredictionStatus, LogsDateStatus } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { CYCLE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  CreateCycleReqBody,
  GetCycleLogsDetailReqBody,
  getCyclePredictionsReqQuery,
  UpdateCycleStatusLogsReqBody
} from '~/models/requests/cycle.request'
import CyclePredictionRepository from '~/repositories/cyclePrediction.repository'
import CycleStatusLogsRepository from '~/repositories/cycleStatusLogs.repository'
import LogsDateRepository from '~/repositories/logsDate.repository'
import ReproductiveCycleRepository from '~/repositories/reproductiveCycle.repository'
import { v4 as ObjectId } from 'uuid'
class CycleServices {
  private reproductiveCycleRepository: ReproductiveCycleRepository
  private cyclePredictionRepository: CyclePredictionRepository
  private cycleStatusLogsRepository: CycleStatusLogsRepository
  private logDateRepository: LogsDateRepository

  constructor() {
    this.reproductiveCycleRepository = new ReproductiveCycleRepository()
    this.cyclePredictionRepository = new CyclePredictionRepository()
    this.cycleStatusLogsRepository = new CycleStatusLogsRepository()
    this.logDateRepository = new LogsDateRepository()
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

  async generateInitialCycleLogs(
    cycle_id: string,
    dates: {
      period_start: Date
      period_end: Date
      fertile_start: Date
      fertile_end: Date
    }
  ) {
    // Dùng Set để đảm bảo các ngày không bị trùng lặp
    const trackableDates = new Set<string>()

    const addDatesToSet = (start: Date, end: Date) => {
      let currentDate = new Date(start)
      const finalDate = new Date(end)
      while (currentDate <= finalDate) {
        // Chuẩn hóa ngày về dạng 'YYYY-MM-DD' để tránh vấn đề timezone
        trackableDates.add(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Thêm các ngày trong kỳ kinh
    addDatesToSet(dates.period_start, dates.period_end)
    // Thêm các ngày trong cửa sổ thụ thai
    addDatesToSet(dates.fertile_start, dates.fertile_end)

    console.log(trackableDates)

    // Chuyển Set thành mảng data để insert
    const logsToCreate = Array.from(trackableDates).map((dateString) => ({
      id: ObjectId(),
      cycle_id,
      log_date: new Date(dateString),
      status: LogsDateStatus.PENDING
    }))

    console.log(logsToCreate)

    // Gọi repository để insert hàng loạt
    await this.logDateRepository.createManyLogDates(logsToCreate)
  }

  async updateLogDateStatus({
    cycle_id,
    log_date,
    status
  }: {
    cycle_id: string
    log_date: Date
    status: LogsDateStatus
  }) {
    return this.logDateRepository.updateLogDateStatus({ cycle_id, log_date, status })
  }

  async getAllLogDateStatus(cycle_id: string) {
    return this.logDateRepository.getAllLogDateStatus(cycle_id)
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

    const predictionsWithStatuses = await Promise.all(
      predictions.map(async (prediction) => {
        const daily_statuses = await this.logDateRepository.getAllLogDateStatus(prediction.cycle_id)
        return {
          ...prediction,
          daily_statuses
        }
      })
    )

    const total = await this.cyclePredictionRepository.countAllPredictionsByUserId(user_id)

    return {
      predictions: predictionsWithStatuses,
      total
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

  async updateCycleStatus(user_id: string, status: CyclePredictionStatus) {
    const cycle = await this.cyclePredictionRepository.getCurrentCyclePredictions(user_id)

    if (!cycle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CYCLE_MESSAGES.CYCLE_NOT_FOUND
      })
    }

    if (cycle.status === CyclePredictionStatus.SKIPPED) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: CYCLE_MESSAGES.CYCLE_ALREADY_CANCELED
      })
    }

    const result = await this.cyclePredictionRepository.updateCycleStatus(cycle.id, status)

    return result
  }

  async getCycleLogsDetail(cycle_id: string, payload: GetCycleLogsDetailReqBody) {
    const { log_date } = payload
    const cycleLog = await this.cycleStatusLogsRepository.getCycleLogsDetail(cycle_id, new Date(log_date))

    if (!cycleLog) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: CYCLE_MESSAGES.CYCLE_LOG_NOT_FOUND
      })
    }

    return cycleLog
  }
}

const cycleServices = new CycleServices()
export default cycleServices
