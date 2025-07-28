import { ParsedQs } from 'qs'

export interface CreateCycleReqBody {
  start_period_date: string
  cycle_length: number
  period_length: number
  note?: string
}

export interface getCyclePredictionsReqQuery extends ParsedQs {
  _start_date: string
  _end_date: string
}

export interface UpdateCycleStatusLogsReqBody {
  log_date: string
  mood: number
  libido: number
  stress: number
  energy: number
  sleep_hours: number
  note?: string
}
