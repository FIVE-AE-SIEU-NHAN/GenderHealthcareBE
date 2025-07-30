import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { addDays } from 'date-fns'

export default class PillLogsRepository {
  private model = prisma.pillLogs

  async createPillLog(user_id: string, log_date: Date) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        user_id,
        log_date
      }
    })
  }

  async updateReminderAt8h(user_id: string, log_date: Date) {
    return this.model.updateMany({
      where: {
        user_id,
        log_date: new Date(log_date.toISOString().split('T')[0])
      },
      data: {
        reminded_at_8h: true
      }
    })
  }

  async updateReminderAt20h(user_id: string, log_date: Date) {
    return this.model.updateMany({
      where: {
        user_id,
        log_date: new Date(log_date.toISOString().split('T')[0])
      },
      data: {
        reminded_at_20h: true
      }
    })
  }

  async getPillLogByUserIdAndDate(user_id: string, log_date: Date) {
    return this.model.findFirst({
      where: {
        user_id,
        log_date: new Date(log_date.toISOString().split('T')[0])
      }
    })
  }

  async takenPillToday(user_id: string, log_date: Date) {
    return this.model.updateMany({
      where: {
        user_id,
        log_date: new Date(log_date.toISOString().split('T')[0])
      },
      data: {
        taken: true
      }
    })
  }
}
