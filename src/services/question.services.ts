import { Topic } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { GetQuestionReqQuery } from '~/models/requests/question.requests'
import ConsultantProfileRepository from '~/repositories/consultant_profile.repository'
import QuestionRepository from '~/repositories/question.repository'

class QuestionServices {
  private questionRepository: QuestionRepository
  private consultantRepository: ConsultantProfileRepository

  constructor() {
    this.questionRepository = new QuestionRepository()
    this.consultantRepository = new ConsultantProfileRepository()
  }

  async getNumberOfConsultantsByTopic(topic: Topic) {
    return this.consultantRepository.getNumberOfConsultantsByTopic(topic)
  }

  async getConsultantIdByIndexAndTopic(index: number, topic: Topic) {
    return this.consultantRepository.getConsultantIdByIndexAndTopic(index, topic)
  }

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
    return this.questionRepository.createQuestion({
      topic,
      question,
      user_id,
      consultant_id
    })
  }

  async getCustomerQuestions(user_id: string, payload: GetQuestionReqQuery) {
    const { _page, _limit, _sort, _order, _topic, _answer, _question_like, _answer_like, _all } = payload
    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit

    const questions = await this.questionRepository.getCustomerQuestions({
      user_id,
      limit,
      _sort,
      _order,
      _topic,
      _question_like,
      _answer_like,
      _skip,
      _all
    })

    const total = await this.questionRepository.countCustomerQuestions({
      user_id,
      _topic,
      _question_like,
      _answer_like,
      _all
    })

    return {
      questions,
      total
    }
  }

  async getConsultantQuestions(consultant_id: string, payload: GetQuestionReqQuery) {
    const { _page, _limit, _sort, _order, _topic, _answer, _question_like, _answer_like, _all } = payload
    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit

    const questions = await this.questionRepository.getConsultantQuestions({
      consultant_id,
      limit,
      _sort,
      _order,
      _topic,
      _question_like,
      _answer_like,
      _skip,
      _all
    })

    const total = await this.questionRepository.countConsultantQuestions({
      consultant_id,
      _topic,
      _question_like,
      _answer_like,
      _all
    })

    return {
      questions,
      total
    }
  }

  async answerQuestion(id: string, answer: string) {
    const question = await this.questionRepository.checkQuestionExists(id)
    if (question.answer) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: QUESTIONS_MESSAGES.QUESTION_ALREADY_ANSWERED
      })
    }
    await this.questionRepository.answerQuestion(id, answer)
  }

  async editAnswerQuestion(id: string, answer: string) {
    const question = await this.questionRepository.checkQuestionExists(id)
    if (!question.answer) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: QUESTIONS_MESSAGES.QUESTION_DO_NOT_HAVE_CONSULTANT_ANSWER
      })
    }
    await this.questionRepository.answerQuestion(id, answer)
  }

  async getAdminQuestions(payload: GetQuestionReqQuery) {
    const { _page, _limit, _sort, _order, _topic, _answer, _question_like, _answer_like, _all } = payload
    const page = parseInt(_page as string, 10) || 1
    const limit = parseInt(_limit as string, 10) || 10
    const _skip = (page - 1) * limit

    const questions = await this.questionRepository.getAdminQuestions({
      limit,
      _sort,
      _order,
      _topic,
      _question_like,
      _answer_like,
      _skip,
      _all
    })

    const total = await this.questionRepository.countAdminQuestions({
      _topic,
      _question_like,
      _answer_like,
      _all
    })

    return {
      questions,
      total
    }
  }

  async editStateQuestion(id: string, is_public: boolean) {
    const question = await this.questionRepository.checkQuestionExists(id)
    if (question.is_public === is_public) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: QUESTIONS_MESSAGES.QUESTION_ALREADY_IN_THIS_STATE
      })
    }
    return this.questionRepository.updateStateQuestion(id, is_public)
  }
}
const questionServices = new QuestionServices()
export default questionServices
