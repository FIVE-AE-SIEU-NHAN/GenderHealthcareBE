import { prisma } from '~/services/client'

export const cyclePredictionServices = {
  async createPrediction({
    user_id,
    cycle_id,
    next_period_date,
    ovulation_date,
    fertile_window_start,
    fertile_window_end,
    pregnancy_risk // <-- THÊM VÀO ĐÂY!
  }: {
    user_id: string
    cycle_id: string
    next_period_date: Date
    ovulation_date: Date
    fertile_window_start: Date
    fertile_window_end: Date
    pregnancy_risk: string   // <-- THÊM VÀO ĐÂY!
  }) {
    const prediction = await prisma.cyclePrediction.create({
      data: {
        user_id,
        cycle_id,
        next_period_date,
        ovulation_date,
        fertile_window_start,
        fertile_window_end,
        pregnancy_risk        // <-- PHẢI TRUYỀN VÀO ĐÂY!
      }
    })
    return prediction
  },

  async getPredictionsByUser(user_id: string) {
    return prisma.cyclePrediction.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' }
    })
  },

  async getAllPredictionsForAdmin() {
    
  return prisma.cyclePrediction.findMany({
    orderBy: { created_at: 'desc' },
    include: {
  cycle: {
    include: {
      user: {
        select: {
          name: true,
          id: true,
        }
      }
    },
    select: {
      last_period_date: true,
      cycle_length: true,
      period_length: true,
      note: true,
      user: true
    }
  }
}  })
  }
}
