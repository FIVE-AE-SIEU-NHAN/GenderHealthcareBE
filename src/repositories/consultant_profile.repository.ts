import { ConsultantProfiles, Topic } from '@prisma/client'
import { prisma } from '~/services/client'

export default class ConsultantProfileRepository {
  private model = prisma.consultantProfiles

  async getNumberOfConsultantsByTopic(topic: Topic) {
    return prisma.consultantProfiles.count({
      where: {
        OR: [{ specialization_1: topic }, { specialization_2: topic }]
      }
    })
  }

  async getConsultantIdByIndexAndTopic(index: number, topic: Topic) {
    const consultant = await prisma.consultantProfiles.findMany({
      where: {
        OR: [{ specialization_1: topic }, { specialization_2: topic }]
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

  async createConsultantProfile({
    id,
    user_id,
    specialization_1,
    specialization_2,
    certifications,
    experienceYears
  }: {
    id: string
    user_id: string
    specialization_1: Topic
    specialization_2?: Topic
    certifications: string
    experienceYears: number
  }) {
    return this.model.create({
      data: {
        id,
        user_id,
        specialization_1,
        specialization_2,
        certifications,
        experienceYears,
        status: 1
      }
    })
  }
}
