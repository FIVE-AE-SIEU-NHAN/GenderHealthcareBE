import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  AnswerQuestionReqBody,
  AskQuestionReqBody,
  EditReqQuery,
  EditStateQuestionReqBody,
  GetQuestionReqQuery
} from '~/models/requests/question.requests'
import questionServices from '~/services/question.services'
import redisUtils from '~/utils/redis'

export const askQuestionController = async (
  req: Request<ParamsDictionary, any, AskQuestionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { topic, question } = req.body
  //   const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1c1d0365-1d64-43d3-894f-d3f69949ebbc'

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
  //   const { user_id } = req.decode_authorization as TokenPayLoad
  const user_id = '1c1d0365-1d64-43d3-894f-d3f69949ebbc'

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
  //   const { consultant_id } = req.decode_authorization as TokenPayLoad
  const consultant_id = '660e8400-e29b-41d4-a716-446655440010'

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

  await questionServices.answerQuestion(id, answer)

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

export const adminQuestionsController = async (
  req: Request<ParamsDictionary, any, any, GetQuestionReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await questionServices.getAdminQuestions(req.query)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.GET_ADMIN_QUESTIONS_SUCCESSFULLY,
    result
  })
}

export const editStateQuestionController = async (
  req: Request<ParamsDictionary, any, EditStateQuestionReqBody, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { is_public } = req.body

  await questionServices.editStateQuestion(id, is_public)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.QUESTION_UPDATED_SUCCESSFULLY
  })
}
