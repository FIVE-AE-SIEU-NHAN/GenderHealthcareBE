import express from 'express'
import {
  answerQuestionsController,
  askQuestionController,
  consultantQuestionsController,
  customerQuestionsController,
  editAnswerQuestionsController
} from '~/controllers/question.controllers'
import { answerQuestionValidator, askQuestionValidator, getQuestionValidator } from '~/middlewares/question.middlewares'
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
 * Description: Get customer questions
 * Path: question/customer
 * Method: GET
 */
questionRouter.get('/customer', /*accessTokenValidator, */ getQuestionValidator, wrapAsync(customerQuestionsController))

/**
 * Description: Get customer questions
 * Path: question/consultant
 * Method: GET
 */
questionRouter.get(
  '/consultant',
  /*accessTokenValidator, */ getQuestionValidator,
  wrapAsync(consultantQuestionsController)
)

/**
 * Description: Answer a question
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
 * Description: Edit a answer
 * Path: question/:id/edit
 * Method: PATCH
 * Request body: { answer: string }
 */
questionRouter.patch(
  '/:id/edit',
  /*accessTokenValidator, */ answerQuestionValidator,
  wrapAsync(editAnswerQuestionsController)
)

export default questionRouter
