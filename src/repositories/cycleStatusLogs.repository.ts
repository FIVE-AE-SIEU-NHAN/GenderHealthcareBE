import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class CycleStatusLogsRepository {
  private model = prisma.cycleStatusLogs

  // async createCycleStatusLogs({
  //   cycle_id,
  //   log_date,
  //   mood,
  //   libido,
  //   stress,
  //   energy,
  //   sleep_hours,
  //   note
  // }: {
  //   cycle_id: string
  //   log_date: Date
  //   mood: number
  //   libido: number
  //   stress: number
  //   energy: number
  //   sleep_hours: number
  //   note?: string
  // }) {
  //   return this.model.create({
  //     data: {
  //       id: ObjectId(),
  //       cycle_id,
  //       log_date,
  //       mood,
  //       libido,
  //       stress,
  //       energy,
  //       sleep_hours,
  //       note
  //     }
  //   })
  // }
}
