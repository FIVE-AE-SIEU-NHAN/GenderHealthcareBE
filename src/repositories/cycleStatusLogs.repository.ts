import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { CycleLogStatus } from '@prisma/client'

export default class CycleStatusLogsRepository {
  private model = prisma.cycleStatusLogs

  async createCycleStatusLogs({
    cycle_id,
    log_date,
    mood,
    libido,
    stress,
    energy,
    sleep_hours,
    note,
    status
  }: {
    cycle_id: string
    log_date: Date
    mood: number
    libido: number
    stress: number
    energy: number
    sleep_hours: number
    note: string
    status: CycleLogStatus
  }) {
    return this.model.create({
      data: {
        id: ObjectId(),
        cycle_id,
        log_date,
        mood,
        libido,
        stress,
        energy,
        sleep_hours,
        note,
        status
      }
    })
  }

  async getCycleLogsDetail(cycle_id: string, log_date: Date) {
    return this.model.findFirst({
      where: {
        cycle_id,
        log_date: {
          gte: new Date(log_date.setHours(0, 0, 0, 0)),
          lt: new Date(log_date.setHours(23, 59, 59, 999))
        }
      }
    })
  }
}
