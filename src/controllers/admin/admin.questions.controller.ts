import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { QUESTIONS_MESSAGES } from '~/constants/messages'
import { EditReqQuery, EditStateQuestionReqBody, GetQuestionReqQuery } from '~/models/requests/question.requests'
import questionServices from '~/services/question.services'

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

export const deleteQuestionController = async (
  req: Request<ParamsDictionary, any, any, EditReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  await questionServices.deleteQuestion(id)

  res.status(200).json({
    message: QUESTIONS_MESSAGES.QUESTION_DELETED_SUCCESSFULLY
  })
}
