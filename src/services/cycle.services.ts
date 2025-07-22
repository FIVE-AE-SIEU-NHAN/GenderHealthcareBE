import { v4 as uuidv4 } from 'uuid'
import { prisma } from '~/services/client'

interface CreateCyclePayload {
  user_id: string;
  last_period_date: string | Date;
  cycle_length: number;
  period_length: number;
  note?: string;
  mood?: number;
  libido?: number;
  stress?: number;
  sleep_hours?: number;
  energy?: number;
}

interface UpdateCyclePayload {
  last_period_date?: string | Date;
  cycle_length?: number;
  period_length?: number;
  note?: string;
  mood?: number;
  libido?: number;
  stress?: number;
  sleep_hours?: number;
  energy?: number;
}
class CycleServices {
 async createCycle(payload: CreateCyclePayload) {
  return await prisma.reproductiveCycle.create({
    data: {
      id: uuidv4(),
      user_id: payload.user_id,
      last_period_date: new Date(payload.last_period_date),
      cycle_length: payload.cycle_length,
      period_length: payload.period_length,
      note: payload.note,
      mood: payload.mood,
      libido: payload.libido,
      stress: payload.stress,
      sleep_hours: payload.sleep_hours,
      energy: payload.energy
    }
  });
}

  async getAllCycles(user_id: string) {
    return await prisma.reproductiveCycle.findMany({
      where: { user_id },
      orderBy: { last_period_date: 'desc' },
       include: {
    user: {        // <-- LẤY THÔNG TIN USER!
      select: {
        name: true // <-- LẤY FIELD TÊN!
      }
    }
  }
    })
  }

  async getCycleById(id: string, user_id: string) {
    return await prisma.reproductiveCycle.findFirst({
      where: { id, user_id }
    })
  }

 async updateCycle(id: string, user_id: string, data: UpdateCyclePayload) {
  const cycle = await this.getCycleById(id, user_id);
  if (!cycle) return null;

  const updateData: any = { ...data };
  if (data.last_period_date) updateData.last_period_date = new Date(data.last_period_date);

  return await prisma.reproductiveCycle.update({
    where: { id },
    data: updateData
  });
}

  async deleteCycle(id: string, user_id: string) {
    const cycle = await this.getCycleById(id, user_id)
    if (!cycle) return null

    return await prisma.reproductiveCycle.delete({
      where: { id }
    })
  }

  async predictCycle(user_id: string) {
  const latest = await prisma.reproductiveCycle.findFirst({
    where: { user_id },
    orderBy: { created_at: 'desc' }
  })
  if (!latest) return null

  // Dự đoán như cũ
  const ovulationDate = new Date(latest.last_period_date)
  ovulationDate.setDate(ovulationDate.getDate() + (latest.cycle_length - 14))

  const nextPeriod = new Date(latest.last_period_date)
  nextPeriod.setDate(nextPeriod.getDate() + latest.cycle_length)

  const fertile_window_start = new Date(ovulationDate.getTime() - 5 * 86400000)
  const fertile_window_end = new Date(ovulationDate.getTime() + 1 * 86400000)

  // DỰ ĐOÁN MỨC ĐỘ MANG THAI
  // Quy tắc: Trong cửa sổ thụ thai => CAO, 2 ngày trước/sau cửa sổ thụ thai => TRUNG BÌNH, còn lại THẤP
  const today = new Date()
  // Set giờ về 0 để so sánh cho dễ
  today.setHours(0, 0, 0, 0)

  let pregnancy_risk: "CAO" | "TRUNG_BÌNH" | "THẤP" = "THẤP"

  if (today >= fertile_window_start && today <= fertile_window_end) {
    pregnancy_risk = "CAO"
  } else {
    // Xác định khoảng TRUNG BÌNH: 2 ngày trước cửa sổ, 2 ngày sau cửa sổ
    const beforeStart = new Date(fertile_window_start)
    beforeStart.setDate(beforeStart.getDate() - 2)
    const afterEnd = new Date(fertile_window_end)
    afterEnd.setDate(afterEnd.getDate() + 2)

    if ((today >= beforeStart && today < fertile_window_start) ||
        (today > fertile_window_end && today <= afterEnd)
    ) {
      pregnancy_risk = "TRUNG_BÌNH"
    }
  }

  // Trả về ISO string để FE dùng
  return {
    next_period_date: nextPeriod.toISOString().split("T")[0],
    ovulation_date: ovulationDate.toISOString().split("T")[0],
    fertile_window_start: fertile_window_start.toISOString().split("T")[0],
    fertile_window_end: fertile_window_end.toISOString().split("T")[0],
    pregnancy_risk
  }
}

} 

export const cycleServices = new CycleServices()
