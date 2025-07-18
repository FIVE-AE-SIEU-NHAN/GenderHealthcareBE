import { prisma } from '~/services/client'

export default class TestPackageRepository {
  private model = prisma.testPackages

  async getAllTestPackages() {
    return this.model.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        target_gender: true,
        level: true,
        testPackageServices: {
          include: {
            testService: {
              select: {
                name: true,
                code: true,
                price: true
              }
            }
          }
        }
      }
    })
  }
}
