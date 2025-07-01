import { v4 as uuidv4 } from 'uuid'
import { prisma } from '~/services/client'

interface CreateCyclePayload {
  user_id: string;
  last_period_date: string | Date;
  cycle_length: number;
  period_length: number;
  note?: string;
}

class CycleServices {
  async createCycle(payload: CreateCyclePayload) {
    const { user_id, last_period_date, cycle_length, period_length, note } = payload;
    return await prisma.reproductiveCycle.create({
      data: { id: uuidv4(), user_id, last_period_date: new Date(last_period_date), cycle_length, period_length, note }
    });
  }

  async predictCycle(user_id: string) {
    const latest = await prisma.reproductiveCycle.findFirst({
      where: { user_id },
      orderBy: { created_at: 'desc' }
    });
    if (!latest) return null;

    const ovulationDate = new Date(latest.last_period_date);
    ovulationDate.setDate(ovulationDate.getDate() + (latest.cycle_length - 14));

    const nextPeriod = new Date(latest.last_period_date);
    nextPeriod.setDate(nextPeriod.getDate() + latest.cycle_length);

    return {
      next_period_date: nextPeriod,
      ovulation_date: ovulationDate,
      fertile_window_start: new Date(ovulationDate.getTime() - 2 * 86400000),
      fertile_window_end: new Date(ovulationDate.getTime() + 2 * 86400000)
    };
  }
}
export const cycleServices = new CycleServices();