import { Topic } from '@prisma/client'
import { ParsedQs } from 'qs'

export interface AskQuestionReqBody {
  topic: Topic
  question: string
}

export interface CustomerQuestionReqQuery extends ParsedQs {
  _page: string
  _limit: string
  _sort?: string
  _order?: string
  _topic?: Topic
  _question_like?: string
  _answer_like?: string
  _all?: string
}
