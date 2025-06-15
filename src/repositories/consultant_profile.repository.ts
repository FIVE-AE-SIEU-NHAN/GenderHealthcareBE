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

  async getConsultantsForAdmin({
    limit,
    _sort,
    _order,
    _specialization_1,
    _specialization_2,
    _gender,
    _date_of_birth,
    _name_like,
    _certifications_like,
    experienceYears_like,
    _skip,
    _all
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    _specialization_1?: Topic
    _specialization_2?: Topic
    _gender?: string
    _date_of_birth?: string
    _name_like?: string
    _certifications_like?: string
    experienceYears_like?: number
    _all?: string
  }) {
    return this.model.findMany({
      select: {
        id: true,
        specialization_1: true,
        specialization_2: true,
        certifications: true,
        experienceYears: true,
        user: {
          select: {
            name: true,
            date_of_birth: true,
            gender: true,
            created_at: true
          }
        }
      },
      where: _all
        ? {
            OR: [
              { certifications: { contains: _all.toLowerCase() } },
              { user: { name: { contains: _all.toLowerCase() } } }
            ],
            specialization_1: _specialization_1,
            specialization_2: _specialization_2,
            experienceYears: experienceYears_like,
            user: {
              date_of_birth: _date_of_birth ? new Date(_date_of_birth) : undefined,
              gender: _gender,
              verify: 0,
              role: 1
            }
          }
        : {
            specialization_1: _specialization_1,
            specialization_2: _specialization_2,
            experienceYears: experienceYears_like,
            certifications: { contains: _certifications_like },
            user: {
              date_of_birth: _date_of_birth ? new Date(_date_of_birth) : undefined,
              name: { contains: _name_like },
              gender: _gender,
              verify: 0,
              role: 1
            }
          },
      orderBy: ['name', 'gender', 'created_at'].includes(_sort as string)
        ? { user: { [_sort as string]: _order || 'asc' } }
        : ['specialization_1', 'specialization_2', 'certifications', 'experienceYears'].includes(_sort as string)
          ? { [_sort as string]: _order || 'asc' }
          : { user: { created_at: 'asc' } },
      skip: _skip,
      take: limit
    })
  }

  async countConsultantsForAdmin({
    _specialization_1,
    _specialization_2,
    _gender,
    _date_of_birth,
    _name_like,
    _certifications_like,
    experienceYears_like,
    _all
  }: {
    _specialization_1?: Topic
    _specialization_2?: Topic
    _gender?: string
    _date_of_birth?: string
    _name_like?: string
    _certifications_like?: string
    experienceYears_like?: number
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            OR: [{ certifications: { contains: _all } }, { user: { name: { contains: _all } } }],
            specialization_1: _specialization_1,
            specialization_2: _specialization_2,
            experienceYears: experienceYears_like,
            user: {
              date_of_birth: _date_of_birth ? new Date(_date_of_birth) : undefined,
              gender: _gender,
              verify: 0,
              role: 1
            }
          }
        : {
            specialization_1: _specialization_1,
            specialization_2: _specialization_2,
            experienceYears: experienceYears_like,
            certifications: { contains: _certifications_like },
            user: {
              date_of_birth: _date_of_birth ? new Date(_date_of_birth) : undefined,
              name: { contains: _name_like },
              gender: _gender,
              verify: 0,
              role: 1
            }
          }
    })
  }
}
