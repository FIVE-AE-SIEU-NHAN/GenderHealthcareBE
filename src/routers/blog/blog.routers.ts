import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getBlogsController, getBlogsDetailController } from '~/controllers/blog.controllers'
import { getBlogsDetailValidator, getBlogsValidator } from '~/middlewares/blog.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const blogRouter = express.Router()

/**
 * Description: Get blog for customer
 * Path: blog/customer
 * Method: GET
 */
blogRouter.get('/customer', accessTokenValidator, getBlogsValidator, wrapAsync(getBlogsController))

/**
 * Description: Get blog detail
 * Path: blog/detail/:id
 * Method: GET
 */
blogRouter.get('/detail/:id', accessTokenValidator, getBlogsDetailValidator, wrapAsync(getBlogsDetailController))

export default blogRouter
