import { Gender, PackageLevel, TimeSlot } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import TestPackageRepository from '~/repositories/testPackage.repository'
import TestPackageServiceRepository from '~/repositories/testPackageService.repository'
import TestServiceAppointmentsRepository from '~/repositories/testServiceAppoinment.repository'

class TestSericeServices {
  private testPackageRepository: TestPackageRepository
  private testPackageServiceRepository: TestPackageServiceRepository
  private testServiceAppointmentsRepository: TestServiceAppointmentsRepository

  constructor() {
    this.testPackageServiceRepository = new TestPackageServiceRepository()
    this.testPackageRepository = new TestPackageRepository()
    this.testServiceAppointmentsRepository = new TestServiceAppointmentsRepository()
  }

  async getAllTestPackageServices() {
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

  async getTestServicePackageId(target_gender: Gender, level: PackageLevel) {
    return this.testPackageRepository.getTestServicePackageId(target_gender, level)
  }

  async createTestServiceAppointment(data: {
    user_id: string
    staff_id: string
    package_id: string
    booking_date: Date
    time_slot: TimeSlot
    note?: string
  }) {
    return this.testServiceAppointmentsRepository.createTestServiceAppointment(data)
  }

  async checkTestServiceAppointmentExists(staff_id: string, booking_date: Date, time_slot: TimeSlot) {
    const consultant = await this.testServiceAppointmentsRepository.checkTestServiceAppointmentExists(
      staff_id,
      booking_date,
      time_slot
    )
    return consultant ? true : false
  }

  async getTestServiceAppointmentById(appointment_id: string) {
    const testServiceAppointment =
      await this.testServiceAppointmentsRepository.getTestServiceAppointmentById(appointment_id)
    if (!testServiceAppointment) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_NOT_FOUND
      })
    }
    return testServiceAppointment
  }

  async deleteTestServiceAppointment(appointment_id: string) {
    return this.testServiceAppointmentsRepository.deleteTestServiceAppointment(appointment_id)
  }
}

const testServiceServices = new TestSericeServices()
export default testServiceServices
