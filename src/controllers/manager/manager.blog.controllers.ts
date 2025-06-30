import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BLOG_MESSAGES } from '~/constants/messages'
import { EditStatusBlogReqBody, GetBlogReqQuery, IdReqQuery } from '~/models/requests/blog.requests'
import { TokenPayLoad } from '~/models/requests/users.requests'
import blogsServices from '~/services/blog.services'

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

export const editStatusBlogController = async (
  req: Request<ParamsDictionary, any, EditStatusBlogReqBody, IdReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { status } = req.body

  await blogsServices.editStatusBlog(id, status)

  res.status(200).json({
    message: BLOG_MESSAGES.BLOG_STATUS_UPDATED_SUCCESSFULLY
  })
}
