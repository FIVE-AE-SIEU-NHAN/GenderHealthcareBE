import { NotificationType } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  AnswerQuestionReqBody,
  AskQuestionReqBody,
  EditReqQuery,
  GetQuestionReqQuery
} from '~/models/requests/question.requests'
import { TokenPayLoad } from '~/models/requests/users.requests'
import notificationServices from '~/services/notification.services'
import questionServices from '~/services/question.services'
import usersServices from '~/services/users.services'
import socketService from '~/socket/socket'
import redisUtils from '~/utils/redis'

export const askQuestionController = async (
  req: Request<ParamsDictionary, any, AskQuestionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { topic, question } = req.body
  const { user_id } = req.decode_authorization as TokenPayLoad

  // lấy danh sách consultant theo topic
  const numberOfCounsultant = await questionServices.getNumberOfConsultantsByTopic(topic)
  if (!numberOfCounsultant) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: QUESTIONS_MESSAGES.QUESTION_DO_NOT_HAVE_CONSULTANT_ANSWER
    })
  }

  // lấy vị trí sẽ trả lời câu hỏi
  const indexOfNextConsultant = await redisUtils.getIndexNextConsultant(topic, numberOfCounsultant)
  // lấy consultant_id theo index
  const consultant_id = await questionServices.getConsultantIdByIndexAndTopic(indexOfNextConsultant, topic)

  // tạo câu hỏi
  await questionServices.createQuestion({
    topic,
    question,
    user_id,
    consultant_id
  })

  res.status(200).json({
    message: QUESTIONS_MESSAGES.QUESTION_CREATED_SUCCESSFULLY
  })
}

export const customerQuestionsController = async (
  req: Request<ParamsDictionary, any, any, GetQuestionReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

  const result = await questionServices.getCustomerQuestions(user_id, req.query)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.GET_CUSTOMER_QUESTIONS_SUCCESSFULLY,
    result
  })
}

export const consultantQuestionsController = async (
  req: Request<ParamsDictionary, any, any, GetQuestionReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad

  const consultant_id = await usersServices.getConsultantIdByUserId(user_id)

  const result = await questionServices.getConsultantQuestions(consultant_id, req.query)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.GET_CONSULTANT_QUESTIONS_SUCCESSFULLY,
    result
  })
}

export const answerQuestionsController = async (
  req: Request<ParamsDictionary, any, AnswerQuestionReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { answer } = req.body
  const { id } = req.params

  const { user_id } = await questionServices.answerQuestion(id, answer)
  if (!user_id) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: QUESTIONS_MESSAGES.USER_ID_NOT_FOUND
    })
  }

  // lưu lịch hẹn vào redis để gửi thông báo và lưu vào database
  const { id: notification_id } = await notificationServices.createNotification({
    user_id,
    type: NotificationType.ANSWERED_QUESTION,
    content: `Your question has been answered successfully`,
    booking_date: new Date(),
    question_id: id,
    is_send: true
  })

  // gửi thông báo thành công cho người dùng qua socket
  const content = `Your question has been answered successfully`
  socketService.sendNotification(user_id, notification_id, content)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.ANSWER_QUESTION_SUCCESSFULLY
  })
}

export const editAnswerQuestionsController = async (
  req: Request<ParamsDictionary, any, AnswerQuestionReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { answer } = req.body
  const { id } = req.params

  await questionServices.editAnswerQuestion(id, answer)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.ANSWER_QUESTION_SUCCESSFULLY
  })
}

export const reportQuestionController = async (
  req: Request<ParamsDictionary, any, any, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  await questionServices.reportQuestion(id)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.REPORT_QUESTION_SUCCESSFULLY
  })
}
