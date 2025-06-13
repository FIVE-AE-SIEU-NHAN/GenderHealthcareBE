import { prisma } from '~/services/client'
import { v4 as ObjectId } from 'uuid'
import { Topic } from '@prisma/client'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTIONS_MESSAGES } from '~/constants/messages'

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
    _topic,
    _question_like,
    _answer_like,
    _all
  }: {
    user_id: string
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    _topic?: Topic
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    if (_all) {
      return this.model.findMany({
        where: {
          user_id,
          topic: _topic,
          OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
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
          created_at: true
        }
      })
    }

    return this.model.findMany({
      where: {
        user_id,
        topic: _topic,
        question: { contains: _question_like },
        answer: { contains: _answer_like },
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
        created_at: true
      }
    })
  }

  async countCustomerQuestions({
    user_id,
    _topic,
    _question_like,
    _answer_like,
    _all
  }: {
    user_id: string
    _topic?: Topic
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    if (_all) {
      return this.model.count({
        where: {
          user_id,
          topic: _topic,
          OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
          is_public: true
        }
      })
    }

    return this.model.count({
      where: {
        user_id,
        topic: _topic,
        question: { contains: _question_like },
        answer: { contains: _answer_like },
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
    _topic,
    _question_like,
    _answer_like,
    _all
  }: {
    consultant_id: string
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    _topic?: Topic
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    if (_all) {
      return this.model.findMany({
        where: {
          consultant_id,
          topic: _topic,
          OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
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
          created_at: true
        }
      })
    }

    return this.model.findMany({
      where: {
        consultant_id,
        topic: _topic,
        question: { contains: _question_like },
        answer: { contains: _answer_like },
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
        created_at: true
      }
    })
  }

  async countConsultantQuestions({
    consultant_id,
    _topic,
    _question_like,
    _answer_like,
    _all
  }: {
    consultant_id: string
    _topic?: Topic
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    if (_all) {
      return this.model.count({
        where: {
          consultant_id,
          topic: _topic,
          OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
          is_public: true
        }
      })
    }
    return this.model.count({
      where: {
        consultant_id,
        topic: _topic,
        question: { contains: _question_like },
        answer: { not: null, contains: _answer_like },
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
        answered_at: new Date()
      }
    })
  }

  async getAdminQuestions({
    _skip,
    limit,
    _sort,
    _order,
    _topic,
    _question_like,
    _answer_like,
    _all
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    _topic?: Topic
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    if (_all) {
      return this.model.findMany({
        where: {
          topic: _topic,
          OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
          is_public: true
        },
        orderBy: {
          [_sort || 'created_at']: _order || 'asc'
        },
        skip: _skip,
        take: limit
      })
    }

    return this.model.findMany({
      where: {
        topic: _topic,
        question: { contains: _question_like },
        answer: { contains: _answer_like },
        is_public: true
      },
      orderBy: {
        [_sort || 'created_at']: _order || 'asc'
      },
      skip: _skip,
      take: limit
    })
  }

  async countAdminQuestions({
    _topic,
    _question_like,
    _answer_like,
    _all
  }: {
    _topic?: Topic
    _question_like?: string
    _answer_like?: string
    _all?: string
  }) {
    if (_all) {
      return this.model.count({
        where: {
          topic: _topic,
          OR: [{ question: { contains: _all } }, { answer: { contains: _all } }],
          is_public: true
        }
      })
    }

    return this.model.count({
      where: {
        topic: _topic,
        question: { contains: _question_like },
        answer: { contains: _answer_like },
        is_public: true
      }
    })
  }

  async updateStateQuestion(id: string, is_public: boolean) {
    console.log(`Updating question ${id} to is_public: ${is_public}`)
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
}
