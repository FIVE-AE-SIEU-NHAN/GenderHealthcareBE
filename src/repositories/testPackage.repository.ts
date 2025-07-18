import { Gender, PackageLevel } from '@prisma/client'
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

  async getTestServicePackageId(target_gender: Gender, level: PackageLevel) {
    return this.model.findFirst({
      select: {
        id: true
      },
      where: {
        target_gender,
        level
      }
    })
  }
}
