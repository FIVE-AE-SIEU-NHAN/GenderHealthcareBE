import { BookingStatus, NotificationType } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { paymentQueue } from '~/bull/queue'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  BookTestServiceAppointmentReqBody,
  EditReqQuery,
  EditStatusTestServiceAppointmentReqBody,
  EditStatusUserReqBody,
  GetTestServiceAppointmentReqQuery,
  UpdateTestServiceResultReqBody
} from '~/models/requests/appointment.requests'
import { TokenPayLoad } from '~/models/requests/users.requests'
import appointmentServices from '~/services/appointment.services'
import notificationServices from '~/services/notification.services'
import paymentServices from '~/services/payment.services'
import testServiceServices from '~/services/testService.services'
import usersServices from '~/services/users.services'
import socketService from '~/socket/socket'
import redisUtils from '~/utils/redis'

export const getTestServicePackagesController = async (
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
      delay: 15 * 60 * 1000,
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
  req: Request<ParamsDictionary, any, EditStatusTestServiceAppointmentReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { status } = req.body
  const { user_id } = req.decode_authorization as TokenPayLoad

  await testServiceServices.editStatusTestServiceAppointment(id, status)

  if (status === BookingStatus.COMPLETED) {
    const content = 'Your test service appointment has been completed. The result is now available in your dasboard.'
    const { id: notification_id } = await notificationServices.createNotification({
      user_id,
      content,
      type: NotificationType.SYSTEM,
      booking_date: new Date(),
      is_send: true
    })
    socketService.sendNotification(notification_id, user_id, content)
  }

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.APPOINTMENT_STATUS_UPDATED_SUCCESSFULLY
  })
}

export const staffTestServiceAppointmentController = async (
  req: Request<ParamsDictionary, any, any, GetTestServiceAppointmentReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  const staff_id = await usersServices.getStaffIdByUserId(user_id)
  const result = await testServiceServices.getStaffTestServiceAppointments(staff_id, req.query)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_STAFF_TEST_SERVICE_APPOINTMENTS_SUCCESSFULLY,
    result
  })
}

export const managerTestServiceAppointmentController = async (
  req: Request<ParamsDictionary, any, any, GetTestServiceAppointmentReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await testServiceServices.managerStaffTestServiceAppointments(req.query)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_MANAGER_TEST_SERVICE_APPOINTMENTS_SUCCESSFULLY,
    result
  })
}

export const getPackageDetailController = async (
  req: Request<ParamsDictionary, any, any, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  const result = await testServiceServices.getPackageDetail(id)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_PACKAGE_DETAIL_SUCCESSFULLY,
    result
  })
}

export const updateTestServiceResultController = async (
  req: Request<ParamsDictionary, any, UpdateTestServiceResultReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  const result = await testServiceServices.updateTestServiceResult(id, req.body)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.UPDATE_TEST_SERVICE_RESULT_SUCCESSFULLY,
    result
  })
}

export const customerTestServiceAppointmentsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

  const result = await testServiceServices.getCustomerTestServiceAppointments(user_id)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_CUSTOMER_TEST_SERVICE_APPOINTMENTS_SUCCESSFULLY,
    result
  })
}

export const getTestServiceResultController = async (
  req: Request<ParamsDictionary, any, UpdateTestServiceResultReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  const result = await testServiceServices.getTestServiceResult(id)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_TEST_SERVICE_RESULT_SUCCESSFULLY,
    result
  })
}
