import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BLOG_MESSAGES } from '~/constants/messages'
import { CreateBlogReqQuery, GetBlogReqQuery } from '~/models/requests/blog.requests'
import { TokenPayLoad } from '~/models/requests/users.requests'
import blogsServices from '~/services/blog.services'

export const getStaffBlogsController = async (
  req: Request<ParamsDictionary, any, any, GetBlogReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  const result = await blogsServices.getStaffBlogs(user_id, req.query)

  res.status(HTTP_STATUS.OK).json({
    message: BLOG_MESSAGES.GET_STAFF_BLOGS_SUCCESSFULLY,
    result
  })
}

export const createBlogsController = async (
  req: Request<ParamsDictionary, any, CreateBlogReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayLoad
  const result = await blogsServices.createBlogs(user_id, req.body)

  res.status(HTTP_STATUS.CREATED).json({
    message: BLOG_MESSAGES.CREATE_BLOG_SUCCESSFULLY
  })
}
