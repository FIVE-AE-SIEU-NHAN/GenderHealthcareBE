import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  deleteQuestionController,
  editStateQuestionController,
  managerQuestionsController
} from '~/controllers/manager/manager.questions.controllers'
import { editStatusQuestionController } from '~/controllers/question.controllers'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import {
  deleteQuestionValidator,
  editStateQuestionValidator,
  editStatusQuestionValidator,
  getQuestionValidator
} from '~/middlewares/question.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const managerQuestionRouter = express.Router()
/**
 * Description: Get question for manager
 * Path: question/manager
 * Method: GET
 */
managerQuestionRouter.get(
  '/manager',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  getQuestionValidator,
  wrapAsync(managerQuestionsController)
)

/**
 * Description: Edit state question for manager
 * Path: question/:id/edit-state
 * Method: PATCH
 * Request body: { is_public: boolean }
 */
managerQuestionRouter.patch(
  '/:id/edit-state',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  editStateQuestionValidator,
  wrapAsync(editStateQuestionController)
)

/**
 * Description: Edit appointment status
 * Path: question/:id/edit-status
 * Method: PATCH
 * Parameters: { id: string }
 * Body: { status: BookingStatus }
 */
managerQuestionRouter.patch(
  '/:id/edit-status',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  editStatusQuestionValidator,
  wrapAsync(editStatusQuestionController)
)

/**
 * Description: Delete a question for manager
 * Path: question/:id/delete
 * Method: DELETE
 */
managerQuestionRouter.delete(
  '/:id/delete',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  deleteQuestionValidator,
  wrapAsync(deleteQuestionController)
)

export default managerQuestionRouter
