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

export interface IdReqQuery extends ParsedQs {
  id: string
}

export interface EditStatusBlogReqBody {
  status: BlogStatus
}

export interface CreateBlogReqQuery {
  title: string
  summary: string
  content: string
  section_1: string
  section_2: string
  cover_image: string
  main_image: string
  sub_image: string
}

export interface UpdateBlogReqQuery {
  title?: string
  summary?: string
  content?: string
  section_1?: string
  section_2?: string
  cover_image?: string
  main_image?: string
  sub_image?: string
}
