import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getStaffBlogsController } from '~/controllers/staff/staff.blog.controllers'
import { getBlogsValidator } from '~/middlewares/blog.middlewares'
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
  //   accessTokenValidator,
  //   requireRole(USER_ROLE.Staff),
  getBlogsValidator,
  wrapAsync(getStaffBlogsController)
)

export default staffBlogRouter
