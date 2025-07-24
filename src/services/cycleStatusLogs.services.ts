import { v4 as uuidv4 } from 'uuid'
import { prisma } from '~/services/client'

export type LogStatusType = 'NORMAL' | 'NEED_ATTENTION' | 'NOT_POSITIVE'
const statusDbMap = {
  NORMAL: 'NORMAL',
  NEED_ATTENTION: 'NEED_ATTENTION',
  NOT_POSITIVE: 'NOT_POSITIVE',
};
interface LogStatusPayload {
  cycle_id: string
  log_date: Date | string
  mood?: number
  libido?: number
  stress?: number
  sleep_hours?: number
  energy?: number
  status?: LogStatusType
}

class CycleStatusLogsService {
  // Thêm một bản ghi log cho cycle (symptom của 1 ngày)
 async createLog(payload: LogStatusPayload) {
  return await prisma.cycleStatusLogs.create({
    data: {
      id: uuidv4(),
      cycle_id: payload.cycle_id,
      log_date: new Date(payload.log_date),
      mood: payload.mood,
      libido: payload.libido,
      stress: payload.stress,
      sleep_hours: payload.sleep_hours,
      energy: payload.energy,
      status: payload.status ? statusDbMap[payload.status] as any as import('@prisma/client').CycleLogStatus : undefined,
    }
  })
}

  // Lấy tất cả log của 1 cycle
  async getLogsByCycleId(cycle_id: string) {
    return await prisma.cycleStatusLogs.findMany({
      where: { cycle_id },
      orderBy: { log_date: 'desc' }
    })
  }

  // Lấy log symptom theo ngày cụ thể (nếu muốn)
  async getLogByCycleIdAndDate(cycle_id: string, log_date: Date | string) {
    const dateObj = typeof log_date === 'string' ? new Date(log_date) : log_date
    return await prisma.cycleStatusLogs.findFirst({
      where: {
        cycle_id,
        log_date: dateObj
      }
    })
  }

  // Xóa 1 log symptom nếu cần
  async deleteLogById(log_id: string) {
    return await prisma.cycleStatusLogs.delete({
      where: { id: log_id }
    })
  }

  // Cập nhật log symptom (hiếm dùng)
  async updateLog(log_id: string, data: Partial<LogStatusPayload>) {
    return await prisma.cycleStatusLogs.update({
      where: { id: log_id },
      data: {
        ...data,
        log_date: data.log_date ? new Date(data.log_date) : undefined
      }
    })
  }
}

export const cycleStatusLogsService = new CycleStatusLogsService()
