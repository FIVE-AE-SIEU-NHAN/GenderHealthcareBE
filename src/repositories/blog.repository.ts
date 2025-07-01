import { BlogStatus } from '@prisma/client'
import { UpdateBlogReqQuery } from '~/models/requests/blog.requests'
import { prisma } from '~/services/client'

export default class BlogRepository {
  private model = prisma.blogs

  async getCustomerBlogs({
    limit,
    _sort,
    _order,
    _skip,
    _title_like
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    _title_like?: string
  }) {
    return this.model.findMany({
      select: {
        id: true,
        author_name: true,
        title: true,
        summary: true,
        cover_image: true,
        created_at: true
      },
      where: {
        ...(_title_like && {
          title: {
            contains: _title_like
          }
        }),
        status: BlogStatus.PUBLISHED
      },
      orderBy: {
        [_sort || 'created_at']: _order || 'desc'
      },
      skip: _skip,
      take: limit
    })
  }

  async countCustomerBlogs({ _title_like }: { _title_like?: string }) {
    return this.model.count({
      where: {
        ...(_title_like && {
          title: {
            contains: _title_like
          }
        }),
        status: BlogStatus.PUBLISHED
      }
    })
  }

  async getBlogDetail(blog_id: string) {
    return this.model.findFirst({
      where: {
        id: blog_id
      },
      select: {
        id: true,
        author_name: true,
        title: true,
        summary: true,
        content: true,
        section_1: true,
        section_2: true,
        cover_image: true,
        main_image: true,
        sub_image: true,
        created_at: true
      }
    })
  }

  async getManagerBlogs({
    limit,
    _sort,
    _order,
    _skip,
    created_at,
    status,
    _author_name_like,
    _title_like,
    _summary_like,
    _content_like,
    _section_1_like,
    _section_2_like,
    _all
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    created_at?: Date[]
    status?: BlogStatus[]
    _author_name_like?: string
    _title_like?: string
    _summary_like?: string
    _content_like?: string
    _section_1_like?: string
    _section_2_like?: string
    _all?: string
  }) {
    return this.model.findMany({
      select: {
        id: true,
        author_name: true,
        title: true,
        summary: true,
        status: true,
        created_at: true
      },
      where: _all
        ? {
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            OR: [
              { author_name: { contains: _all } },
              { title: { contains: _all } },
              { summary: { contains: _all } },
              { content: { contains: _all } },
              { section_1: { contains: _all } },
              { section_2: { contains: _all } }
            ]
          }
        : {
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(_author_name_like && {
              author_name: {
                contains: _author_name_like
              }
            }),
            ...(_title_like && {
              title: {
                contains: _title_like
              }
            }),
            ...(_summary_like && {
              summary: {
                contains: _summary_like
              }
            }),
            ...(_content_like && {
              content: {
                contains: _content_like
              }
            }),
            ...(_section_1_like && {
              section_1: {
                contains: _section_1_like
              }
            }),
            ...(_section_2_like && {
              section_2: {
                contains: _section_2_like
              }
            })
          },
      orderBy: {
        [_sort || 'created_at']: _order || 'desc'
      },
      skip: _skip,
      take: limit
    })
  }

  async countManagerBlogs({
    created_at,
    status,
    _author_name_like,
    _title_like,
    _summary_like,
    _content_like,
    _section_1_like,
    _section_2_like,
    _all
  }: {
    created_at?: Date[]
    status?: BlogStatus[]
    _author_name_like?: string
    _title_like?: string
    _summary_like?: string
    _content_like?: string
    _section_1_like?: string
    _section_2_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            OR: [
              { author_name: { contains: _all } },
              { title: { contains: _all } },
              { summary: { contains: _all } },
              { content: { contains: _all } },
              { section_1: { contains: _all } },
              { section_2: { contains: _all } }
            ]
          }
        : {
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(_author_name_like && {
              author_name: {
                contains: _author_name_like
              }
            }),
            ...(_title_like && {
              title: {
                contains: _title_like
              }
            }),
            ...(_summary_like && {
              summary: {
                contains: _summary_like
              }
            }),
            ...(_content_like && {
              content: {
                contains: _content_like
              }
            }),
            ...(_section_1_like && {
              section_1: {
                contains: _section_1_like
              }
            }),
            ...(_section_2_like && {
              section_2: {
                contains: _section_2_like
              }
            })
          }
    })
  }

  async getBlogById(id: string) {
    return this.model.findUnique({
      where: {
        id
      }
    })
  }

  async updateBlogStatus(id: string, status: BlogStatus) {
    return this.model.update({
      where: {
        id
      },
      data: {
        status
      }
    })
  }

  async getStaffBlogs({
    user_id,
    limit,
    _sort,
    _order,
    _skip,
    created_at,
    status,
    _author_name_like,
    _title_like,
    _summary_like,
    _content_like,
    _section_1_like,
    _section_2_like,
    _all
  }: {
    user_id: string
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    created_at?: Date[]
    status?: BlogStatus[]
    _author_name_like?: string
    _title_like?: string
    _summary_like?: string
    _content_like?: string
    _section_1_like?: string
    _section_2_like?: string
    _all?: string
  }) {
    return this.model.findMany({
      select: {
        id: true,
        author_name: true,
        title: true,
        summary: true,
        status: true,
        created_at: true
      },
      where: _all
        ? {
            user_id,
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            OR: [
              { author_name: { contains: _all } },
              { title: { contains: _all } },
              { summary: { contains: _all } },
              { content: { contains: _all } },
              { section_1: { contains: _all } },
              { section_2: { contains: _all } }
            ]
          }
        : {
            user_id,
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(_author_name_like && {
              author_name: {
                contains: _author_name_like
              }
            }),
            ...(_title_like && {
              title: {
                contains: _title_like
              }
            }),
            ...(_summary_like && {
              summary: {
                contains: _summary_like
              }
            }),
            ...(_content_like && {
              content: {
                contains: _content_like
              }
            }),
            ...(_section_1_like && {
              section_1: {
                contains: _section_1_like
              }
            }),
            ...(_section_2_like && {
              section_2: {
                contains: _section_2_like
              }
            })
          },
      orderBy: {
        [_sort || 'created_at']: _order || 'desc'
      },
      skip: _skip,
      take: limit
    })
  }

  async countStaffBlogs({
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
  }: {
    user_id: string
    created_at?: Date[]
    status?: BlogStatus[]
    _author_name_like?: string
    _title_like?: string
    _summary_like?: string
    _content_like?: string
    _section_1_like?: string
    _section_2_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            user_id,
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            OR: [
              { author_name: { contains: _all } },
              { title: { contains: _all } },
              { summary: { contains: _all } },
              { content: { contains: _all } },
              { section_1: { contains: _all } },
              { section_2: { contains: _all } }
            ]
          }
        : {
            user_id,
            ...(status && { status: { in: status } }),
            ...(created_at?.length === 2 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[1].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T23:59:59.999Z`
              }
            }),
            ...(_author_name_like && {
              author_name: {
                contains: _author_name_like
              }
            }),
            ...(_title_like && {
              title: {
                contains: _title_like
              }
            }),
            ...(_summary_like && {
              summary: {
                contains: _summary_like
              }
            }),
            ...(_content_like && {
              content: {
                contains: _content_like
              }
            }),
            ...(_section_1_like && {
              section_1: {
                contains: _section_1_like
              }
            }),
            ...(_section_2_like && {
              section_2: {
                contains: _section_2_like
              }
            })
          }
    })
  }

  async createBlog({
    blog_id,
    user_id,
    author_name,
    title,
    summary,
    content,
    section_1,
    section_2,
    cover_image,
    main_image,
    sub_image
  }: {
    blog_id: string
    user_id: string
    author_name: string
    title: string
    summary: string
    content: string
    section_1: string
    section_2: string
    cover_image: string
    main_image: string
    sub_image: string
  }) {
    const newBlog = await this.model.create({
      data: {
        id: blog_id,
        user_id,
        author_name,
        title,
        summary,
        content,
        section_1,
        section_2,
        cover_image,
        main_image,
        sub_image,
        created_at: new Date(),
        status: BlogStatus.DRAFT
      }
    })
    return newBlog
  }

  async updateBlog(blog_id: string, payload: UpdateBlogReqQuery) {
    return this.model.update({
      where: {
        id: blog_id
      },
      data: {
        ...payload,
        status: BlogStatus.DRAFT
      }
    })
  }
}
