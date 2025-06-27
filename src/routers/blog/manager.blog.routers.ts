import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { getManagerBlogsController } from '~/controllers/blog.controllers'
import { getBlogsValidator } from '~/middlewares/blog.middlewares'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const managerBlogRouter = express.Router()

/**
 * Description: Get blog for customer
 * Path: blog/customer
 * Method: GET
 */
managerBlogRouter.get(
  '/manager',
  // accessTokenValidator,
  getBlogsValidator,
  wrapAsync(getManagerBlogsController)
)

export default managerBlogRouter

// staff: xem danh sách bài viết(của chính user_id đó), tạo bài viết, sửa bài viết
// manager: xem danh sách bài viết, đổi trạng thái bài viết
