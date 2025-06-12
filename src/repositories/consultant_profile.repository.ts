import { ConsultantProfiles, Topic } from '@prisma/client'
import { prisma } from '~/services/client'

export default class ConsultantProfileRepository {
  private model = prisma.consultantProfiles

  async getNumberOfConsultantsByTopic(topic: Topic) {
    return prisma.consultantProfiles.count({
      where: {
        OR: [{ topic_1: topic }, { topic_2: topic }]
      }
    })
  }

  async getConsultantIdByIndexAndTopic(index: number, topic: Topic) {
    const consultant = await prisma.consultantProfiles.findMany({
      where: {
        OR: [{ topic_1: topic }, { topic_2: topic }]
      },
      orderBy: {
        id: 'asc'
      },
      skip: index,
      take: 1,
      select: {
        id: true
      }
    })
    return consultant[0].id
  }
}
