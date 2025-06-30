import { BlogStatus } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { BLOG_MESSAGES, QUESTIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { GetBlogReqQuery } from '~/models/requests/blog.requests'
import BlogRepository from '~/repositories/blog.repository'

class BlogServices {
  private blogRepository: BlogRepository

  constructor() {
    this.blogRepository = new BlogRepository()
  }

  async getCustomerBlogs(payload: GetBlogReqQuery) {
    const { _page, _limit, _sort, _order, _title_like } = payload

    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit

    const blogs = await this.blogRepository.getCustomerBlogs({
      limit,
      _sort,
      _order,
      _skip,
      _title_like
    })

    const total = await this.blogRepository.countCustomerBlogs({
      _title_like
    })

    return {
      blogs,
      total
    }
  }

  async getCustomerBlogDetail(blog_id: string) {
    const blog = await this.blogRepository.getCustomerBlogDetail(blog_id)

    if (!blog) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: BLOG_MESSAGES.BLOG_NOT_FOUND
      })
    }

    return {
      blog
    }
  }

  async getManagerBlogs(payload: GetBlogReqQuery) {
    const {
      _page,
      _limit,
      _sort,
      _order,
      _status,
      _created_at,
      _author_name_like,
      _title_like,
      _summary_like,
      _content_like,
      _section_1_like,
      _section_2_like,
      _all
    } = payload

    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit

    const created_at = Array.isArray(_created_at)
      ? _created_at.map((created_at) => new Date(created_at)).sort((a, b) => a.getTime() - b.getTime())
      : _created_at
        ? [new Date(_created_at)]
        : undefined

    const status = Array.isArray(_status) ? _status : _status ? [_status] : undefined

    const blogs = await this.blogRepository.getManagerBlogs({
      limit,
      _sort,
      _order,
      _skip,
      status,
      created_at,
      _author_name_like,
      _title_like,
      _summary_like,
      _content_like,
      _section_1_like,
      _section_2_like,
      _all
    })

    const total = await this.blogRepository.countManagerBlogs({
      created_at,
      status,
      _author_name_like,
      _title_like,
      _summary_like,
      _content_like,
      _section_1_like,
      _section_2_like,
      _all
    })

    return {
      blogs,
      total
    }
  }

  async editStatusBlog(id: string, status: BlogStatus) {
    const blog = await this.blogRepository.getBlogById(id)

    if (!blog) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: BLOG_MESSAGES.BLOG_NOT_FOUND
      })
    }

    if (blog.status === status) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: BLOG_MESSAGES.BLOG_ALREADY_IN_THIS_STATUS
      })
    }

    await this.blogRepository.updateBlogStatus(id, status)
  }

  async getStaffBlogs(user_id: string, payload: GetBlogReqQuery) {
    const {
      _page,
      _limit,
      _sort,
      _order,
      _status,
      _created_at,
      _author_name_like,
      _title_like,
      _summary_like,
      _content_like,
      _section_1_like,
      _section_2_like,
      _all
    } = payload

    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit

    const created_at = Array.isArray(_created_at)
      ? _created_at.map((created_at) => new Date(created_at)).sort((a, b) => a.getTime() - b.getTime())
      : _created_at
        ? [new Date(_created_at)]
        : undefined

    const status = Array.isArray(_status) ? _status : _status ? [_status] : undefined

    const blogs = await this.blogRepository.getStaffBlogs({
      user_id,
      limit,
      _sort,
      _order,
      _skip,
      status,
      created_at,
      _author_name_like,
      _title_like,
      _summary_like,
      _content_like,
      _section_1_like,
      _section_2_like,
      _all
    })

    const total = await this.blogRepository.countStaffBlogs({
      user_id,
      created_at,
      status,
      _author_name_like,
      _title_like,
      _summary_like,
      _content_like,
      _section_1_like,
      _section_2_like,
      _all
    })

    return {
      blogs,
      total
    }
  }
}

const blogsServices = new BlogServices()
export default blogsServices
