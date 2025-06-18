import express from 'express'
import {
  adminQuestionsController,
  deleteQuestionController,
  editStateQuestionController
} from '~/controllers/admin/admin.questions.controller'
import {
  deleteQuestionValidator,
  editStateQuestionValidator,
  getQuestionValidator
} from '~/middlewares/question.middlewares'
import { wrapAsync } from '~/utils/handler'

const adminQuestionRouter = express.Router()
/**
 * Description: Get question for admin
 * Path: question/admin
 * Method: GET
 */
adminQuestionRouter.get(
  '/admin',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  getQuestionValidator,
  wrapAsync(adminQuestionsController)
)

/**
 * Description: Edit state question for admin
 * Path: question/:id/edit
 * Method: PATCH
 * Request body: { is_public: boolean }
 */
adminQuestionRouter.patch(
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
adminQuestionRouter.delete(
  '/:id/delete',
  // accessTokenValidator,
  // requireRole(USER_ROLE.Admin),
  deleteQuestionValidator,
  wrapAsync(deleteQuestionController)
)

export default adminQuestionRouter
