import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  adminQuestionsController,
  answerQuestionsController,
  askQuestionController,
  consultantQuestionsController,
  customerQuestionsController,
  deleteQuestionController,
  editAnswerQuestionsController,
  editStateQuestionController
} from '~/controllers/question.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import {
  answerQuestionValidator,
  askQuestionValidator,
  deleteQuestionValidator,
  editStateQuestionValidator,
  getQuestionValidator
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
questionRouter.post('/ask', accessTokenValidator, askQuestionValidator, wrapAsync(askQuestionController))

/**
 * Description: Get questions of customer
 * Path: question/customer
 * Method: GET
 */
questionRouter.get(
  '/customer',
  // accessTokenValidator,
  // requireRole(USER_ROLE.User),
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
  // accessTokenValidator,
  // requireRole(USER_ROLE.Consultant),
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
  // accessTokenValidator,
  // requireRole(USER_ROLE.Consultant),
  answerQuestionValidator,
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
  // accessTokenValidator,
  // requireRole(USER_ROLE.Consultant),
  answerQuestionValidator,
  wrapAsync(editAnswerQuestionsController)
)
/**
 * Description: Get question for admin
 * Path: question/admin
 * Method: GET
 */
questionRouter.get(
  '/admin',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  getQuestionValidator,
  wrapAsync(adminQuestionsController)
)

/**
 * Description: Edit a question for admin
 * Path: question/:id/edit
 * Method: PATCH
 * Request body: { is_public: boolean }
 */
questionRouter.patch(
  '/:id/edit',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  editStateQuestionValidator,
  wrapAsync(editStateQuestionController)
)

/**
 * Description: Delete a question for admin
 * Path: question/:id/delete
 * Method: DELETE
 */
questionRouter.delete(
  '/:id/delete',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  deleteQuestionValidator,
  wrapAsync(deleteQuestionController)
)

export default questionRouter
