import { BlogStatus } from '@prisma/client'
import { ParsedQs } from 'qs'

export interface GetBlogReqQuery extends ParsedQs {
  _page: string
  _limit: string
  _sort?: string
  _order?: string
  _created_at?: string[]
  _status?: BlogStatus[]
  _author_name_like?: string
  _title_like?: string
  _summary_like?: string
  _content_like?: string
  _section_1_like?: string
  _section_2_like?: string
  _all?: string
}
