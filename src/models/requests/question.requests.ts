import { Topic } from '@prisma/client'
import { ParsedQs } from 'qs'
import { QuestionStatus } from '~/constants/enums'

export interface AskQuestionReqBody {
  topic: Topic
  question: string
}

export interface GetQuestionReqQuery extends ParsedQs {
  _page: string
  _limit: string
  _sort?: string
  _order?: string
  _topic?: Topic[]
  _status?: string[]
  _created_at?: string[]
  _question_like?: string
  _answer_like?: string
  _all?: string
}
export interface EditReqQuery extends ParsedQs {
  id: string
}
export interface AnswerQuestionReqBody {
  answer: string
}

export interface EditStateQuestionReqBody {
  is_public: boolean
}

export interface EditStatusQuestionReqBody {
  status: QuestionStatus
}
