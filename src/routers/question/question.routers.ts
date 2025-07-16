import express from 'express'
import { report } from 'process'
import { USER_ROLE } from '~/constants/enums'
import {
  answerQuestionsController,
  askQuestionController,
  consultantQuestionsController,
  customerQuestionsController,
  editAnswerQuestionsController,
  reportQuestionController
} from '~/controllers/question.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import {
  answerQuestionValidator,
  askQuestionValidator,
  getQuestionValidator,
  reportQuestionValidator
} from '~/middlewares/question.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const questionRouter = express.Router()

/**
 * Description: Create a new question
 * Path: question/ask
 * Method: POST
 * Request body: { title: string, description: string}
 */
questionRouter.post(
  '/ask',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  askQuestionValidator,
  wrapAsync(askQuestionController)
)

/**
 * Description: Get questions of customer
 * Path: question/customer
 * Method: GET
 */
questionRouter.get(
  '/customer',
  accessTokenValidator,
  requireRole(USER_ROLE.User),
  getQuestionValidator,
  wrapAsync(customerQuestionsController)
)

/**
 * Description: Get questions for consultant
 * Path: question/consultant
 * Method: GET
 */
questionRouter.get(
  '/consultant',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant),
  getQuestionValidator,
  wrapAsync(consultantQuestionsController)
)

/**
 * Description: Answer a question for consultant
 * Path: question/:id/answer
 * Method: PATCH
 * Request body: { answer: string }
 */
questionRouter.patch(
  '/:id/answer',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant),
  answerQuestionValidator,
  wrapAsync(answerQuestionsController)
)

/**
 * Description: Edit a answer for consultant
 * Path: question/:id/edit-answer
 * Method: PATCH
 * Request body: { answer: string }
 */
questionRouter.patch(
  '/:id/edit-answer',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant),
  answerQuestionValidator,
  wrapAsync(editAnswerQuestionsController)
)

/**
 * Description: Report a question
 * Path: question/:id/report
 * Method: POST
 */
questionRouter.post(
  '/:id/report',
  accessTokenValidator,
  requireRole(USER_ROLE.Consultant),
  reportQuestionValidator,
  wrapAsync(reportQuestionController)
)

export default questionRouter
