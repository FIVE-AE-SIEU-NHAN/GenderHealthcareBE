import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'

export default class TestServicesRepository {
  private model = prisma.testServices

  async getTestServiceById(id: string) {
    return this.model.findUnique({
      where: { id }
    })
  }
}
