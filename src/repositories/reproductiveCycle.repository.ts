import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class ReproductiveCycleRepository {
  private model = prisma.reproductiveCycle

  async createCycle({
    user_id,
    start_period_date,
    cycle_length,
    period_length,
    note
  }: {
    user_id: string
    start_period_date: Date
    cycle_length: number
    period_length: number
    note?: string
  }) {
    return this.model.create({
      data: {
        id: ObjectId(),
        user_id,
        start_period_date,
        cycle_length,
        period_length,
        ...(note ? { note } : { note: '' })
      }
    })
  }
}
