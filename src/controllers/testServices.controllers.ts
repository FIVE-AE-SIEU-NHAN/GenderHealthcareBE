import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { paymentQueue } from '~/bull/queue'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  BookTestServiceAppointmentReqBody,
  EditReqQuery,
  EditStatusUserReqBody
} from '~/models/requests/appointment.requests'
import { TokenPayLoad } from '~/models/requests/users.requests'
import appointmentServices from '~/services/appointment.services'
import paymentServices from '~/services/payment.services'
import testServiceServices from '~/services/testService.services'
import usersServices from '~/services/users.services'
import redisUtils from '~/utils/redis'

export const getTestServicePacketController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const result = await testServiceServices.getAllTestPackageServices()

  res.status(HTTP_STATUS.OK).json({
    message: 'Test service packets retrieved successfully',
    result
  })
}

export const bookTestServiceAppointmentController = async (
  req: Request<ParamsDictionary, any, BookTestServiceAppointmentReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { target_gender, level, booking_date, time_slot, note } = req.body
  const { user_id } = req.decode_authorization as TokenPayLoad

  // lấy id của gói dịch vụ xét nghiệm
  const testServicePackage = await testServiceServices.getTestServicePackageId(target_gender, level)
  if (!testServicePackage) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: APPOINTMENT_MESSAGES.TEST_SERVICE_PACKAGE_NOT_FOUND
    })
  }

  // kiểm tra staff nào sẽ phục vụ khách hàng
  const numberOfStaff = await usersServices.getNumberOfStaff()
  if (!numberOfStaff) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: APPOINTMENT_MESSAGES.NO_AVAILABLE_STAFF
    })
  }

  // kiểm tra xem có staff nào rảnh không
  const startIndex = await redisUtils.getIndexNextStaff(numberOfStaff)
  let selectedStaffId = ''

  for (let i = 0; i < numberOfStaff; i++) {
    const currentIndex = (startIndex + i) % numberOfStaff

    // lấy staff theo index
    const staff_id = await usersServices.getStaffByIndex(currentIndex)

    // kiểm tra xem staff có lịch hẹn nào trùng với booking_date và time_slot không
    const isBusy = await testServiceServices.checkTestServiceAppointmentExists(
      staff_id,
      new Date(booking_date),
      time_slot
    )

    if (!isBusy) {
      await redisUtils.setNextStaffIndex(currentIndex + 1)
      selectedStaffId = staff_id
      break
    }
  }

  if (!selectedStaffId) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.CONFLICT,
      message: APPOINTMENT_MESSAGES.NO_AVAILABLE_STAFF
    })
  }

  // tạo lịch hẹn
  const { id: appointment_id } = await testServiceServices.createTestServiceAppointment({
    user_id,
    staff_id: selectedStaffId,
    package_id: testServicePackage.id,
    booking_date: new Date(booking_date),
    time_slot,
    note
  })

  // tạo đơn thanh toán qua PayOS
  const amount = 10000
  const result = await paymentServices.createTestServicePaymentLink({
    amount,
    appointment_id,
    user_id
  })

  // tạo job hủy thanh toán nếu sau 15 phút không thanh toán
  paymentQueue.add(
    'cancel-payment-after-15-minutes',
    {
      user_id,
      orderCode: result.orderCode.toString()
    },
    {
      delay: 1 * 30 * 1000,
      jobId: result.orderCode,
      removeOnComplete: true
    }
  )

  res.status(HTTP_STATUS.CREATED).json({
    message: APPOINTMENT_MESSAGES.BOOKING_CREATED_SUCCESSFULLY,
    result
  })
}

export const editStatusTestServiceAppointmentController = async (
  req: Request<ParamsDictionary, any, EditStatusUserReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { status } = req.body

  await testServiceServices.editStatusTestServiceAppointment(id, status)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.APPOINTMENT_STATUS_UPDATED_SUCCESSFULLY
  })
}
