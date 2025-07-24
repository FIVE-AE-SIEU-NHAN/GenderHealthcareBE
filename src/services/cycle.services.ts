import { v4 as uuidv4 } from 'uuid';
import { prisma } from '~/services/client';

// Nếu đặt utils ở file riêng thì import từ '~/utils/cycle'
export type CycleLogStatus = "NORMAL" | "NEED_ATTENTION" | "NOT_POSITIVE" | null;
export function convertStatusToEnum(
  status: string | undefined
): CycleLogStatus {
  if (!status) return null;
  const normalized = status.trim().toLowerCase();
  if (normalized === "normal") return "NORMAL";
  if (normalized === "need attention") return "NEED_ATTENTION";
  if (normalized === "not positive") return "NOT_POSITIVE";
  if (normalized === "bình thường") return "NORMAL";
  if (normalized === "cần chú ý") return "NEED_ATTENTION";
  if (normalized === "không tích cực") return "NOT_POSITIVE";
  return null;
}

interface CreateCyclePayload {
  user_id: string;
  start_period_date: string | Date;
  cycle_length: number;
  period_length: number;
  note?: string;
}

interface UpdateCyclePayload {
  start_period_date?: string | Date;
  cycle_length?: number;
  period_length?: number;
  note?: string;
}

interface CreateCycleLogPayload {
  cycle_id: string;
  log_date: string | Date;
  mood?: number;
  libido?: number;
  stress?: number;
  sleep_hours?: number;
  energy?: number;
  status?: string; // Truyền string FE hoặc BE sẽ convert
}

class CycleServices {
  async createCycle(payload: CreateCyclePayload) {
    return await prisma.reproductiveCycle.create({
      data: {
        id: uuidv4(),
        user_id: payload.user_id,
        start_period_date: new Date(payload.start_period_date),
        cycle_length: payload.cycle_length,
        period_length: payload.period_length,
        note: payload.note,
      }
    });
  }

  async getAllCycles(user_id: string) {
    return await prisma.reproductiveCycle.findMany({
      where: { user_id },
      orderBy: { start_period_date: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });
  }

  async getCycleById(id: string, user_id: string) {
    return await prisma.reproductiveCycle.findFirst({
      where: { id, user_id }
    });
  }

  async getLatestCycle(user_id: string) {
    return await prisma.reproductiveCycle.findFirst({
      where: { user_id },
      orderBy: { start_period_date: 'desc' }
    });
  }

  async updateCycle(id: string, user_id: string, data: UpdateCyclePayload) {
    const cycle = await this.getCycleById(id, user_id);
    if (!cycle) return null;
    const updateData: any = { ...data };
    if (data.start_period_date) updateData.start_period_date = new Date(data.start_period_date);

    return await prisma.reproductiveCycle.update({
      where: { id },
      data: updateData
    });
  }

  async deleteCycle(id: string, user_id: string) {
    const cycle = await this.getCycleById(id, user_id);
    if (!cycle) return null;
    return await prisma.reproductiveCycle.delete({
      where: { id }
    });
  }

  // ---- LOGS ----
  async createCycleLog(payload: CreateCycleLogPayload) {
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
        status: convertStatusToEnum(payload.status), // Sử dụng hàm convert ở đây!
      }
    });
  }

  async getLogsByCycleId(cycle_id: string) {
    return await prisma.cycleStatusLogs.findMany({
      where: { cycle_id },
      orderBy: { log_date: 'asc' }
    });
  }

  // ---- Prediction ----
  async predictCycle(cycle_id: string) {
    // lấy chu kỳ theo id
    const cycle = await prisma.reproductiveCycle.findUnique({
      where: { id: cycle_id }
    });
    if (!cycle) return null;

    // Tính toán dự đoán
    const ovulationDate = new Date(cycle.start_period_date);
    ovulationDate.setDate(ovulationDate.getDate() + (cycle.cycle_length - 14));
    const nextPeriod = new Date(cycle.start_period_date);
    nextPeriod.setDate(nextPeriod.getDate() + cycle.cycle_length);

    const fertile_window_start = new Date(ovulationDate.getTime() - 5 * 86400000);
    const fertile_window_end = new Date(ovulationDate.getTime() + 1 * 86400000);

    // DỰ ĐOÁN MỨC ĐỘ MANG THAI
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pregnancy_risk: "CAO" | "TRUNG_BÌNH" | "THẤP" = "THẤP";

    if (today >= fertile_window_start && today <= fertile_window_end) {
      pregnancy_risk = "CAO";
    } else {
      const beforeStart = new Date(fertile_window_start);
      beforeStart.setDate(beforeStart.getDate() - 2);
      const afterEnd = new Date(fertile_window_end);
      afterEnd.setDate(afterEnd.getDate() + 2);
      if ((today >= beforeStart && today < fertile_window_start) ||
        (today > fertile_window_end && today <= afterEnd)
      ) {
        pregnancy_risk = "TRUNG_BÌNH";
      }
    }

    return {
      next_period_date: nextPeriod.toISOString().split("T")[0],
      ovulation_date: ovulationDate.toISOString().split("T")[0],
      fertile_window_start: fertile_window_start.toISOString().split("T")[0],
      fertile_window_end: fertile_window_end.toISOString().split("T")[0],
      pregnancy_risk
    };
  }
}

export const cycleServices = new CycleServices();
