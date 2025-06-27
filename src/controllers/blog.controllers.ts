import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BLOG_MESSAGES } from '~/constants/messages'
import { GetBlogReqQuery, IdReqQuery } from '~/models/requests/blog.requests'
import blogsServices from '~/services/blog.services'

export const getBlogsController = async (
  req: Request<ParamsDictionary, any, any, GetBlogReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await blogsServices.getCustomerBlogs(req.query)

  res.status(HTTP_STATUS.OK).json({
    message: BLOG_MESSAGES.GET_CUSTOMER_BLOGS_SUCCESSFULLY,
    result
  })
}

export const getBlogsDetailController = async (
  req: Request<ParamsDictionary, any, any, IdReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id: blog_id } = req.params
  const result = await blogsServices.getCustomerBlogDetail(blog_id)

  res.status(HTTP_STATUS.OK).json({
    message: BLOG_MESSAGES.GET_CUSTOMER_BLOG_DETAIL_SUCCESSFULLY,
    result
  })
}

export const getManagerBlogsController = async (
  req: Request<ParamsDictionary, any, any, GetBlogReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const result = await blogsServices.getManagerBlogs(req.query)

  res.status(HTTP_STATUS.OK).json({
    message: BLOG_MESSAGES.GET_MANAGER_BLOGS_SUCCESSFULLY,
    result
  })
}
