import { prisma } from '~/services/client';

export const cyclePredictionServices = {
  async createPrediction({
    cycle_id,
    next_period_date,
    ovulation_date,
    fertile_window_start,
    fertile_window_end,
    pregnancy_risk
  }: {
    cycle_id: string
    next_period_date: Date
    ovulation_date: Date
    fertile_window_start: Date
    fertile_window_end: Date
    pregnancy_risk: string
  }) {
    const prediction = await prisma.cyclePrediction.create({
      data: {
        cycle_id,
        next_period_date,
        ovulation_date,
        fertile_window_start,
        fertile_window_end,
        pregnancy_risk
      }
    });
    return prediction;
  },

  async getPredictionsByCycle(cycle_id: string) {
    return prisma.cyclePrediction.findMany({
      where: { cycle_id },
      orderBy: { created_at: 'desc' }
    });
  },

  async getAllPredictionsForAdmin() {
    return prisma.cyclePrediction.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        cycle: {
          include: {
            user: { select: { name: true, id: true } }
          },
          select: {
            start_period_date: true,
            cycle_length: true,
            period_length: true,
            note: true,
            user: true
          }
        }
      }
    });
  }
}
