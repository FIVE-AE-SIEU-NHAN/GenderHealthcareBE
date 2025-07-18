import TestPackageRepository from '~/repositories/testPackage.repository'
import TestPackageServiceRepository from '~/repositories/testPackageService.repository'

class TestSericeServices {
  private testPackageRepository: TestPackageRepository
  private testPackageServiceRepository: TestPackageServiceRepository

  constructor() {
    this.testPackageServiceRepository = new TestPackageServiceRepository()
    this.testPackageRepository = new TestPackageRepository()
  }

  async getAllTestPackageServices() {
    // return this.testPackageServiceRepository.getAllTestPackageServices()

    const packages = await this.testPackageRepository.getAllTestPackages()

    const formatted = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      target_gender: pkg.target_gender,
      level: pkg.level,
      services: pkg.testPackageServices.map((ps) => ps.testService)
    }))

    return formatted
  }
}

const testServiceServices = new TestSericeServices()
export default testServiceServices
