import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class TestResultRepository {
  private model = prisma.testResults

  async createTestResult({
    test_service_appointment_id,
    test_service_id,
    result,
    unit,
    test_date,
    note
  }: {
    test_service_appointment_id: string
    test_service_id: string
    result: string
    unit?: string
    test_date: Date
    note?: string
  }) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        test_service_appointment_id,
        test_service_id,
        result,
        ...(unit && { unit }),
        test_date: new Date(test_date),
        ...(note && { note })
      }
    })
  }

  async getTestServiceResultByAppointmentId(id: string) {
    return this.model.findMany({
      where: { test_service_appointment_id: id }
    })
  }
}
