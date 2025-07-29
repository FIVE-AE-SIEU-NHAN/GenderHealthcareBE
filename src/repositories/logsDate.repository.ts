import { prisma } from '~/services/client'
import { LogsDateStatus, Prisma } from '@prisma/client'

export default class LogsDateRepository {
  private model = prisma.logsDate

  async createManyLogDates(data: Prisma.LogsDateCreateManyInput[]) {
    return this.model.createMany({
      data,
      skipDuplicates: true
    })
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
    return this.model.updateMany({
      where: {
        cycle_id,
        log_date
      },
      data: {
        status
      }
    })
  }

  async getAllLogDateStatus(cycle_id: string) {
    return this.model.findMany({
      where: {
        cycle_id
      },
      select: {
        log_date: true,
        status: true
      }
    })
  }
}
