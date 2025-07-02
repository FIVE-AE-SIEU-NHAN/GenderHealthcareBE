import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { APPOINTMENT_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  BookAppointmentReqBody,
  EditReqQuery,
  EditStatusUserReqBody,
  GetAppointmentReqQuery
} from '~/models/requests/appointment.requests'
import { TokenPayLoad } from '~/models/requests/users.requests'
import appointmentServices from '~/services/appointment.services'
import notificationServices from '~/services/notification.services'
import questionServices from '~/services/question.services'
import usersServices from '~/services/users.services'
import redisUtils from '~/utils/redis'

export const bookAppointmentController = async (
  req: Request<ParamsDictionary, any, BookAppointmentReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { topic, booking_date, time_slot } = req.body
  const { user_id } = req.decode_authorization as TokenPayLoad

  // lấy danh sách consultant theo topic
  const numberOfCounsultant = await questionServices.getNumberOfConsultantsByTopic(topic)
  if (!numberOfCounsultant) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: APPOINTMENT_MESSAGES.TOPIC_DO_NOT_HAVE_CONSULTANT
    })
  }

  // kiểm tra xem có consultant nào rảnh không
  const startIndex = await redisUtils.getIndexNextConsultantForBookingAppointment(topic, numberOfCounsultant)
  let selectedConsultantId = ''

  for (let i = 0; i < numberOfCounsultant; i++) {
    const currentIndex = (startIndex + i) % numberOfCounsultant

    // lấy consultant theo topic và index
    const consultant_id = await usersServices.getConsultantByTopicAndIndex(topic, currentIndex)

    // để xử lý trường hợp consultant có 2 topic mà topic kia đã có lịch hẹn đúng booking_date và time_slot
    const isBusy = await appointmentServices.checkAppointmentExists(consultant_id, new Date(booking_date), time_slot)

    if (!isBusy) {
      await redisUtils.setNextConsultantIndex(topic, currentIndex + 1)
      selectedConsultantId = consultant_id
      break
    }
  }

  // nếu không có consultant nào rảnh thì báo lỗi
  if (!selectedConsultantId) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.CONFLICT,
      message: APPOINTMENT_MESSAGES.NO_AVAILABLE_CONSULTANT
    })
  }

  // tạo lịch hẹn
  const { id: appointment_id } = await appointmentServices.createAppointment({
    user_id,
    consultant_id: selectedConsultantId,
    topic,
    booking_date: new Date(booking_date),
    time_slot
  })

  // lưu lịch hẹn vào redis để gửi thông báo và lưu vào database
  await notificationServices.addNotificationForConsultantAppointment(
    user_id,
    selectedConsultantId,
    appointment_id,
    new Date(booking_date),
    time_slot
  )

  res.status(HTTP_STATUS.CREATED).json({
    message: APPOINTMENT_MESSAGES.BOOKING_CREATED_SUCCESSFULLY
  })
}

export const consultantAppointmentsController = async (
  req: Request<ParamsDictionary, any, any, GetAppointmentReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

  const consultant_id = await usersServices.getConsultantIdByUserId(user_id)

  const result = await appointmentServices.getConsultantAppointments(consultant_id, req.query)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_CONSULTANT_APPOINTMENTS_SUCCESSFULLY,
    result
  })
}

export const customerAppointmentsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

  const result = await appointmentServices.getCustomerAppointments(user_id)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_CUSTOMER_APPOINTMENTS_SUCCESSFULLY,
    result
  })
}

export const editStatusAppointmentController = async (
  req: Request<ParamsDictionary, any, EditStatusUserReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { status } = req.body

  await appointmentServices.editStatusAppointment(id, status)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.APPOINTMENT_STATUS_UPDATED_SUCCESSFULLY
  })
}

export const managerAppointmentsController = async (
  req: Request<ParamsDictionary, any, any, GetAppointmentReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await appointmentServices.getManagerAppointments(req.query)

  res.status(200).json({
    message: APPOINTMENT_MESSAGES.GET_MANAGER_APPOINTMENTS_SUCCESSFULLY,
    result
  })
}
