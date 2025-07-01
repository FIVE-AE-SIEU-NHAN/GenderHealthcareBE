import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import {
  createBlogsController,
  getStaffBlogsController,
  updateBlogController
} from '~/controllers/staff/staff.blog.controllers'
import { createBlogsValidator, getBlogsValidator, updateBlogsValidator } from '~/middlewares/blog.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const staffBlogRouter = express.Router()

/**
 * Description: Get blog of staff
 * Path: blog/staff
 * Method: GET
 */
staffBlogRouter.get(
  '/staff',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff),
  getBlogsValidator,
  wrapAsync(getStaffBlogsController)
)

/**
 * Description: Create a new blog for staff
 * Path: blog/staff
 * Method: POST
 */
staffBlogRouter.post(
  '/create',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff),
  createBlogsValidator,
  wrapAsync(createBlogsController)
)

/**
 * Description: Update blog for staff
 * Path: blog/detail/:id
 * Method: PATCH
 */
staffBlogRouter.patch(
  '/detail/:id',
  accessTokenValidator,
  requireRole(USER_ROLE.Staff),
  updateBlogsValidator,
  wrapAsync(updateBlogController)
)

export default staffBlogRouter
