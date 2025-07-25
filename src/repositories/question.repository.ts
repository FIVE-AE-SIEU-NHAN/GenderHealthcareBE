import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { Topic } from '@prisma/client'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTIONS_MESSAGES } from '~/constants/messages'
import { QuestionStatus } from '~/constants/enums'

export default class QuestionRepository {
  private model = prisma.questions

  async createQuestion({
    topic,
    question,
    user_id,
    consultant_id
  }: {
    topic: Topic
    question: string
    user_id: string
    consultant_id: string
  }) {
    const id = ObjectId()
    return this.model.create({
      data: {
        id,
        user_id,
        consultant_id,
        topic,
        question,
        answer: '',
        status: 0,
        created_at: new Date()
      }
    })
  }

  async getCustomerQuestions({
    user_id,
    _skip,
    limit,
    _sort,
    _order,
    topic,
    status,
    created_at,
    _question_like,
    _answer_like,
    _all
  }: {
    user_id: string
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    topic?: Topic[]
    status?: number[]
    created_at?: Date[]
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    return this.model.findMany({
      where: _all
        ? {
            user_id,
            ...(topic && { topic: { in: topic } }),
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
            OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
            is_public: true
          }
        : {
            user_id,
            ...(topic && { topic: { in: topic } }),
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
            ...(_question_like && {
              question: {
                contains: _question_like
              }
            }),
            ...(_answer_like && {
              answer: {
                contains: _answer_like
              }
            }),
            is_public: true
          },
      orderBy: {
        [_sort || 'created_at']: _order || 'asc'
      },
      skip: _skip,
      take: limit,
      select: {
        id: true,
        topic: true,
        question: true,
        answer: true,
        created_at: true,
        status: true
      }
    })
  }

  async countCustomerQuestions({
    user_id,
    topic,
    status,
    created_at,
    _question_like,
    _answer_like,
    _all
  }: {
    user_id: string
    topic?: Topic[]
    status?: number[]
    created_at?: Date[]
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            user_id,
            ...(topic && { topic: { in: topic } }),
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
            OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
            is_public: true
          }
        : {
            user_id,
            ...(topic && { topic: { in: topic } }),
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
            ...(_question_like && {
              question: {
                contains: _question_like
              }
            }),
            ...(_answer_like && {
              answer: {
                contains: _answer_like
              }
            }),
            is_public: true
          }
    })
  }

  async getConsultantQuestions({
    consultant_id,
    _skip,
    limit,
    _sort,
    _order,
    topic,
    status,
    created_at,
    _question_like,
    _answer_like,
    _all
  }: {
    consultant_id: string
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    topic?: Topic[]
    status?: number[]
    created_at?: Date[]
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    return this.model.findMany({
      where: _all
        ? {
            consultant_id,
            ...(topic && { topic: { in: topic } }),
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
            OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
            is_public: true
          }
        : {
            consultant_id,
            ...(topic && { topic: { in: topic } }),
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
            ...(_question_like && {
              question: {
                contains: _question_like
              }
            }),
            ...(_answer_like && {
              answer: {
                contains: _answer_like
              }
            }),
            is_public: true
          },
      orderBy: {
        [_sort || 'created_at']: _order || 'asc'
      },
      skip: _skip,
      take: limit,
      select: {
        id: true,
        user_id: true,
        topic: true,
        question: true,
        answer: true,
        created_at: true,
        status: true
      }
    })
  }

  async countConsultantQuestions({
    consultant_id,
    topic,
    status,
    created_at,
    _question_like,
    _answer_like,
    _all
  }: {
    consultant_id: string
    topic?: Topic[]
    status?: number[]
    created_at?: Date[]
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            consultant_id,
            ...(topic && { topic: { in: topic } }),
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
            OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
            is_public: true
          }
        : {
            consultant_id,
            ...(topic && { topic: { in: topic } }),
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
            ...(_question_like && {
              question: {
                contains: _question_like
              }
            }),
            ...(_answer_like && {
              answer: {
                contains: _answer_like
              }
            }),
            is_public: true
          }
    })
  }

  async checkQuestionExists(id: string) {
    const question = await this.model.findUnique({
      where: { id },
      select: { id: true, answer: true, is_public: true }
    })

    if (!question) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: QUESTIONS_MESSAGES.QUESTION_NOT_FOUND
      })
    }

    return question
  }

  async answerQuestion(id: string, answer: string) {
    return this.model.update({
      where: { id },
      data: {
        answer,
        status: 1,
        answered_at: new Date()
      }
    })
  }

  async getManagerQuestions({
    _skip,
    limit,
    _sort,
    _order,
    topic,
    status,
    created_at,
    _question_like,
    _answer_like,
    _all
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    topic?: Topic[]
    status?: number[]
    created_at?: Date[]
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    return this.model.findMany({
      where: _all
        ? {
            ...(topic && { topic: { in: topic } }),
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
            OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
            is_public: true
          }
        : {
            ...(topic && { topic: { in: topic } }),
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
            ...(_question_like && {
              question: {
                contains: _question_like
              }
            }),
            ...(_answer_like && {
              answer: {
                contains: _answer_like
              }
            })
          },
      orderBy: {
        [_sort || 'created_at']: _order || 'asc'
      },
      skip: _skip,
      take: limit
    })
  }

  async countManagerQuestions({
    topic,
    status,
    created_at,
    _question_like,
    _answer_like,
    _all
  }: {
    topic?: Topic[]
    status?: number[]
    created_at?: Date[]
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            ...(topic && { topic: { in: topic } }),
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
            OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
            is_public: true
          }
        : {
            ...(topic && { topic: { in: topic } }),
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
            ...(_question_like && {
              question: {
                contains: _question_like
              }
            }),
            ...(_answer_like && {
              answer: {
                contains: _answer_like
              }
            })
          }
    })
  }

  async updateStateQuestion(id: string, is_public: boolean) {
    return this.model.update({
      where: { id },
      data: { is_public }
    })
  }

  async deleteQuestion(id: string) {
    return this.model.delete({
      where: { id }
    })
  }

  async reportQuestion(id: string) {
    return this.model.update({
      where: { id },
      data: { status: 2 }
    })
  }

  async getQuestionStatus(id: string) {
    return this.model.findUnique({
      where: {
        id
      },
      select: {
        status: true
      }
    })
  }

  async updateStatusQuestion(id: string, status: QuestionStatus) {
    return this.model.update({
      where: { id },
      data: { status }
    })
  }
}
