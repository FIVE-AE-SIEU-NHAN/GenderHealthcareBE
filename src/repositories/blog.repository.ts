import { BlogStatus } from '@prisma/client'
import { prisma } from '~/services/client'

export default class BlogRepository {
  private model = prisma.blogs

  async getCustomerBlogs({
    limit,
    _sort,
    _order,
    _skip,
    created_at,
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
        cover_image: true,
        created_at: true
      },
      where: _all
        ? {
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
            ],
            status: BlogStatus.PUBLISHED
          }
        : {
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
            }),
            status: BlogStatus.PUBLISHED
          },
      orderBy: {
        [_sort || 'created_at']: _order || 'asc'
      },
      skip: _skip,
      take: limit
    })
  }

  async countCustomerBlogs({
    created_at,
    _author_name_like,
    _title_like,
    _summary_like,
    _content_like,
    _section_1_like,
    _section_2_like,
    _all
  }: {
    created_at?: Date[]
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
            ],
            status: BlogStatus.PUBLISHED
          }
        : {
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
            }),
            status: BlogStatus.PUBLISHED
          }
    })
  }

  async getCustomerBlogDetail(blog_id: string) {
    return this.model.findFirst({
      where: {
        id: blog_id,
        status: BlogStatus.PUBLISHED
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
}
