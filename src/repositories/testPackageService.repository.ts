import { prisma } from '~/services/client'

export default class TestPackageServiceRepository {
  private model = prisma.testPackageServices

  async getAllTestPackageServices() {
    return this.model.findMany({
      include: {
        testPackage: true,
        testService: true
      }
    })
  }
}
