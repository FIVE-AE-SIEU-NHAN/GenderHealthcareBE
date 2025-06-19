import { ConsultantProfiles, Topic } from '@prisma/client'
import { UpdateConsultantProfileReqBody } from '~/models/requests/users.requests'
import { prisma } from '~/services/client'

export default class ConsultantProfileRepository {
  private model = prisma.consultantProfiles

  async getNumberOfConsultantsByTopic(topic: Topic) {
    return prisma.consultantProfiles.count({
      where: {
        OR: [{ specialization_1: topic }, { specialization_2: topic }],
        status: 1
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
    _skip,
    specialization,
    gender,
    date_of_birth,
    created_at,
    experienceYears,
    _name_like,
    _certifications_like,
    _all
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    specialization?: Topic[]
    gender?: string[]
    date_of_birth?: Date[]
    created_at?: Date[]
    experienceYears?: number
    _name_like?: string
    _certifications_like?: string
    _all?: string
  }) {
    console.log('all', _all)
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
        },
        status: true
      },
      where: _all
        ? {
            ...(specialization && {
              OR: [{ specialization_1: { in: specialization } }, { specialization_2: { in: specialization } }]
            }),
            user: {
              ...(gender && { gender: { in: gender } }),
              ...(date_of_birth?.length === 2 && {
                date_of_birth: {
                  gte: date_of_birth[0],
                  lte: date_of_birth[1]
                }
              }),
              ...(date_of_birth?.length === 1 && {
                date_of_birth: date_of_birth[0]
              }),
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
              verify: 0,
              role: 1
            },
            OR: [{ certifications: { contains: _all } }, { user: { name: { contains: _all } } }]
          }
        : {
            ...(specialization && {
              OR: [{ specialization_1: { in: specialization } }, { specialization_2: { in: specialization } }]
            }),
            ...(experienceYears && {
              experienceYears: {
                equals: experienceYears
              }
            }),
            ...(_certifications_like && {
              certifications: {
                contains: _certifications_like
              }
            }),
            user: {
              ...(gender && { gender: { in: gender } }),
              ...(date_of_birth?.length === 2 && {
                date_of_birth: {
                  gte: date_of_birth[0],
                  lte: date_of_birth[1]
                }
              }),
              ...(date_of_birth?.length === 1 && {
                date_of_birth: date_of_birth[0]
              }),
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
              ...(_name_like && {
                name: {
                  contains: _name_like
                }
              }),
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
    specialization,
    gender,
    date_of_birth,
    created_at,
    experienceYears,
    _name_like,
    _certifications_like,
    _all
  }: {
    specialization?: Topic[]
    gender?: string[]
    date_of_birth?: Date[]
    created_at?: Date[]
    experienceYears?: number
    _name_like?: string
    _certifications_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            ...(specialization && {
              OR: [{ specialization_1: { in: specialization } }, { specialization_2: { in: specialization } }]
            }),
            user: {
              ...(gender && { gender: { in: gender } }),
              ...(date_of_birth?.length === 2 && {
                date_of_birth: {
                  gte: date_of_birth[0],
                  lte: date_of_birth[1]
                }
              }),
              ...(date_of_birth?.length === 1 && {
                date_of_birth: date_of_birth[0]
              }),
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
              verify: 0,
              role: 1
            },
            OR: [{ certifications: { contains: _all } }, { user: { name: { contains: _all } } }]
          }
        : {
            ...(specialization && {
              OR: [{ specialization_1: { in: specialization } }, { specialization_2: { in: specialization } }]
            }),
            ...(experienceYears && {
              experienceYears: {
                equals: experienceYears
              }
            }),
            ...(_certifications_like && {
              certifications: {
                contains: _certifications_like
              }
            }),
            user: {
              ...(gender && { gender: { in: gender } }),
              ...(date_of_birth?.length === 2 && {
                date_of_birth: {
                  gte: date_of_birth[0],
                  lte: date_of_birth[1]
                }
              }),
              ...(date_of_birth?.length === 1 && {
                date_of_birth: date_of_birth[0]
              }),
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
              ...(_name_like && {
                name: {
                  contains: _name_like
                }
              }),
              verify: 0,
              role: 1
            }
          }
    })
  }

  async getConsultantStatus(id: string) {
    return this.model.findUnique({
      where: { id },
      select: { status: true }
    })
  }

  async updateStatusConsultant(id: string, status: number) {
    return this.model.update({
      where: { id },
      data: { status }
    })
  }

  async getConsultantById(user_id: string) {
    return this.model.findUnique({
      where: { user_id },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            date_of_birth: true,
            gender: true,
            phone_number: true,
            google_id: true
          }
        },
        specialization_1: true,
        specialization_2: true,
        certifications: true,
        experienceYears: true,
        status: true
      }
    })
  }

  async updateConsultantProfile(user_id: string, payload: UpdateConsultantProfileReqBody): Promise<ConsultantProfiles> {
    return this.model.update({
      where: { user_id },
      data: {
        ...payload,
        user: {
          update: {
            updated_at: new Date()
          }
        }
      }
    })
  }
}
