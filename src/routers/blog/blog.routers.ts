import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getBlogsController } from '~/controllers/blog.controllers'
import { getBlogsValidator } from '~/middlewares/blog.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'

const blogRouter = express.Router()

/**
 * Description: Get blog for customer
 * Path: blog/customer
 * Method: GET
 */
blogRouter.get(
  '/customer',
  // accessTokenValidator,
  getBlogsValidator,
  getBlogsController
)

export default blogRouter
