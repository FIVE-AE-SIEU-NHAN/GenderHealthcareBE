import { sign } from 'crypto'
import express from 'express'
import { TokenType } from '~/constants/enums'
import {
  adminQuestionsController,
  answerQuestionsController,
  askQuestionController,
  consultantQuestionsController,
  customerQuestionsController,
  editAnswerQuestionsController,
  editStateQuestionController
} from '~/controllers/question.controllers'
import {
  answerQuestionValidator,
  askQuestionValidator,
  editStateQuestionValidator,
  getQuestionValidator
} from '~/middlewares/question.middlewares'
import { wrapAsync } from '~/utils/handler'

const questionRouter = express.Router()

/**
 * Description: Create a new question
 * Path: question/ask
 * Method: POST
 * Request body: { title: string, description: string}
 */
questionRouter.post('/ask', /*accessTokenValidator,*/ askQuestionValidator, wrapAsync(askQuestionController))

/**
 * Description: Get questions of customer
 * Path: question/customer
 * Method: GET
 */
questionRouter.get('/customer', /*accessTokenValidator, */ getQuestionValidator, wrapAsync(customerQuestionsController))

/**
 * Description: Get questions for consultant
 * Path: question/consultant
 * Method: GET
 */
questionRouter.get(
  '/consultant',
  /*accessTokenValidator, */ getQuestionValidator,
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
  /*accessTokenValidator, */ answerQuestionValidator,
  wrapAsync(answerQuestionsController)
)

/**
 * Description: Edit a answer for consultant
 * Path: question/:id/consultant-edit
 * Method: PATCH
 * Request body: { answer: string }
 */
questionRouter.patch(
  '/:id/consultant-edit',
  /*accessTokenValidator, */ answerQuestionValidator,
  wrapAsync(editAnswerQuestionsController)
)
/**
 * Description: Get question for admin
 * Path: question/admin
 * Method: GET
 */
questionRouter.get('/admin', /*accessTokenValidator, */ getQuestionValidator, wrapAsync(adminQuestionsController))

/**
 * Description: Edit a question for admin
 * Path: question/:id/edit
 * Method: PATCH
 * Request body: { is_public: boolean }
 */
questionRouter.patch(
  '/:id/edit',
  /*accessTokenValidator, */ editStateQuestionValidator,
  wrapAsync(editStateQuestionController)
)

export default questionRouter
