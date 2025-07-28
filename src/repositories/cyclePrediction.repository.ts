import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { CycleLogStatus, CyclePredictionStatus } from '@prisma/client'

export default class CyclePredictionRepository {
  private model = prisma.cyclePrediction

  async checkActiveCycle(user_id: string) {
    return this.model.findMany({
      where: {
        cycle: {
          user_id
        },
        status: CyclePredictionStatus.ACTIVE
      }
    })
  }

  async createCyclePrediction({
    cycle_id,
    next_period_date,
    period_end_date,
    ovulation_date,
    fertile_window_start,
    fertile_window_end
  }: {
    cycle_id: string
    next_period_date: Date
    period_end_date: Date
    ovulation_date: Date
    fertile_window_start: Date
    fertile_window_end: Date
  }) {
    return await this.model.create({
      data: {
        id: ObjectId(),
        cycle_id,
        next_period_date,
        period_end_date,
        ovulation_date,
        fertile_window_start,
        fertile_window_end
      }
    })
  }

  async getCyclePredictionsByUserId({
    user_id,
    start_date,
    end_date
  }: {
    user_id: string
    start_date: Date
    end_date: Date
  }) {
    return await this.model.findMany({
      select: {
        id: true,
        cycle_id: true,
        next_period_date: true,
        period_end_date: true,
        ovulation_date: true,
        fertile_window_start: true,
        fertile_window_end: true,
        cycle: {
          select: {
            start_period_date: true,
            cycle_length: true,
            period_length: true,
            note: true
          }
        },
        status: true
      },
      where: {
        cycle: {
          user_id
        },
        OR: [
          {
            next_period_date: {
              gte: start_date,
              lte: end_date
            }
          },
          {
            period_end_date: {
              gte: start_date,
              lte: end_date
            }
          },
          {
            ovulation_date: {
              gte: start_date,
              lte: end_date
            }
          },
          {
            fertile_window_start: {
              gte: start_date,
              lte: end_date
            }
          },
          {
            fertile_window_end: {
              gte: start_date,
              lte: end_date
            }
          }
        ]
      },
      orderBy: {
        next_period_date: 'desc'
      }
    })
  }

  async getCurrentCyclePredictions(user_id: string) {
    return this.model.findFirst({
      select: {
        id: true,
        cycle_id: true,
        next_period_date: true,
        period_end_date: true,
        ovulation_date: true,
        fertile_window_start: true,
        fertile_window_end: true,
        cycle: {
          select: {
            start_period_date: true,
            cycle_length: true,
            period_length: true,
            note: true
          }
        },
        status: true
      },
      where: {
        cycle: {
          user_id
        },
        status: CyclePredictionStatus.ACTIVE
      },
      orderBy: {
        next_period_date: 'desc'
      }
    })
  }

  async updateCycleStatus(cycle_id: string, status: CyclePredictionStatus) {
    return this.model.update({
      where: {
        id: cycle_id
      },
      data: {
        status
      }
    })
  }
}
