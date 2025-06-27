import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { editStatusBlogController, getManagerBlogsController } from '~/controllers/manager/manager.blog.controllers'
import { editStatusBlogValidator, getBlogsValidator } from '~/middlewares/blog.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const managerBlogRouter = express.Router()

/**
 * Description: Get blog for manager
 * Path: blog/manager
 * Method: GET
 */
managerBlogRouter.get(
  '/manager',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  getBlogsValidator,
  wrapAsync(getManagerBlogsController)
)

/**
 * Description: Edit blog status
 * Path: blog/manager/:id/edit-status
 * Method: PATCH
 */
managerBlogRouter.patch(
  '/manager/:id/edit-status',
  accessTokenValidator,
  requireRole(USER_ROLE.Manager),
  editStatusBlogValidator,
  wrapAsync(editStatusBlogController)
)
export default managerBlogRouter
