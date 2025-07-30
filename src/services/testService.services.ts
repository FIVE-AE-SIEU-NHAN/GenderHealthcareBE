import { Gender, PackageLevel, TestServiceBookingStatus, TimeSlot } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  GetTestServiceAppointmentReqQuery,
  UpdateTestServiceResultReqBody
} from '~/models/requests/appointment.requests'
import TestPackageRepository from '~/repositories/testPackage.repository'
import TestResultRepository from '~/repositories/testResult.repository'
import TestServicesRepository from '~/repositories/testService.repositoty'
import TestServiceAppointmentsRepository from '~/repositories/testServiceAppoinment.repository'

class TestServiceServices {
  private testPackageRepository: TestPackageRepository
  private testServicesRepository: TestServicesRepository
  private testServiceAppointmentsRepository: TestServiceAppointmentsRepository
  private testResultRepository: TestResultRepository

  constructor() {
    this.testServicesRepository = new TestServicesRepository()
    this.testPackageRepository = new TestPackageRepository()
    this.testServiceAppointmentsRepository = new TestServiceAppointmentsRepository()
    this.testResultRepository = new TestResultRepository()
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

  async editStatusTestServiceAppointment(id: string, status: TestServiceBookingStatus) {
    const testServiceAppointment = await this.testServiceAppointmentsRepository.getTestServiceAppointmentById(id)
    if (!testServiceAppointment) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_NOT_FOUND
      })
    }
    if (testServiceAppointment.status === status) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_ALREADY_IN_THIS_STATUS
      })
    }
    return this.testServiceAppointmentsRepository.updateStatusTestServiceAppointment(id, status)
  }

  async getStaffTestServiceAppointments(staff_id: string, payload: GetTestServiceAppointmentReqQuery) {
    const { _start_date, _end_date, _status } = payload

    const start_day = new Date(_start_date!)
    const end_day = new Date(_end_date!)
    const status = Array.isArray(_status) ? _status : _status ? [_status] : undefined

    const testServiceAppointments = await this.testServiceAppointmentsRepository.getStaffTestServiceAppointments({
      staff_id,
      start_day,
      end_day,
      status
    })

    return {
      testServiceAppointments,
      total: testServiceAppointments.length
    }
  }

  async managerStaffTestServiceAppointments(payload: GetTestServiceAppointmentReqQuery) {
    const { _start_date, _end_date, _status } = payload

    const start_day = new Date(_start_date!)
    const end_day = new Date(_end_date!)
    const status = Array.isArray(_status) ? _status : _status ? [_status] : undefined

    const testServiceAppointments = await this.testServiceAppointmentsRepository.getManagerTestServiceAppointments({
      start_day,
      end_day,
      status
    })

    return {
      testServiceAppointments,
      total: testServiceAppointments.length
    }
  }

  async getPackageDetail(id: string) {
    const testServiceAppointment = await this.testServiceAppointmentsRepository.getTestServiceAppointmentById(id)
    if (!testServiceAppointment) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_NOT_FOUND
      })
    }

    const { package_id } = testServiceAppointment

    const packageDetail = await this.testPackageRepository.getPackageDetail(package_id)
    if (!packageDetail) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_PACKAGE_NOT_FOUND
      })
    }

    const formatted = {
      id: packageDetail.id,
      name: packageDetail.name,
      test_service_appointment_id: id,
      services: packageDetail.testPackageServices.map((ps) => {
        return {
          service_id: ps.test_service_id,
          name: ps.testService.name
        }
      })
    }
    return formatted
  }

  async updateTestServiceResult(id: string, data: UpdateTestServiceResultReqBody) {
    const testService = await this.testServicesRepository.getTestServiceById(id)
    if (!testService) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_NOT_FOUND
      })
    }

    const testServiceAppointment = await this.testServiceAppointmentsRepository.getTestServiceAppointmentById(
      data.test_service_appointment_id
    )

    if (!testServiceAppointment) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: APPOINTMENT_MESSAGES.TEST_SERVICE_APPOINTMENT_NOT_FOUND
      })
    }

    const { test_service_appointment_id, result, unit, test_date, note } = data
    const resultCreate = await this.testResultRepository.createTestResult({
      test_service_appointment_id,
      test_service_id: id,
      result,
      unit,
      test_date,
      note
    })

    return resultCreate
  }

  async getCustomerTestServiceAppointments(user_id: string) {
    return await this.testServiceAppointmentsRepository.getCustomerTestServiceAppointments(user_id)
  }

  async getTestServiceResult(id: string) {
    return this.testResultRepository.getTestServiceResultByAppointmentId(id)
  }
}

const testServiceServices = new TestServiceServices()
export default testServiceServices
