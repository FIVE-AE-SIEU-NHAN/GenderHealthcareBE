import { spec } from 'node:test/reporters'
import { UpdateStaffProfileReqBody } from '~/models/requests/users.requests'
import { prisma } from '~/services/client'

export default class StaffProfileRepository {
  private model = prisma.staffProfiles

  async getStaffById(user_id: string) {
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
        specialization: true,
        status: true
      }
    })
  }

  async getStaffStatus(id: string) {
    return this.model.findUnique({
      where: { id },
      select: { status: true }
    })
  }

  async updateStatusStaff(id: string, status: number) {
    return this.model.update({
      where: { id },
      data: { status }
    })
  }

  async getStaffsForAdmin({
    limit,
    _sort,
    _order,
    _skip,
    gender,
    status,
    date_of_birth,
    created_at,
    _name_like,
    _specialization_like,
    _all
  }: {
    _skip: number
    limit: number
    _sort?: string
    _order?: string
    gender?: string[]
    status?: number[]
    date_of_birth?: Date[]
    created_at?: Date[]
    _name_like?: string
    _specialization_like?: string
    _all?: string
  }) {
    return this.model.findMany({
      select: {
        id: true,
        specialization: true,
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
            ...(status && { status: { in: status } }),
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
              role: 4
            },
            OR: [{ specialization: { contains: _all } }, { user: { name: { contains: _all } } }]
          }
        : {
            ...(status && { status: { in: status } }),
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
              role: 4
            },
            ...(_specialization_like && {
              specialization: {
                contains: _specialization_like
              }
            })
          },
      orderBy: ['name', 'gender', 'created_at', 'date_of_birth'].includes(_sort as string)
        ? { user: { [_sort as string]: _order || 'asc' } }
        : ['specialization', 'status'].includes(_sort as string)
          ? { [_sort as string]: _order || 'asc' }
          : { user: { created_at: 'asc' } },
      skip: _skip,
      take: limit
    })
  }

  async countStaffsForAdmin({
    gender,
    status,
    date_of_birth,
    created_at,
    _name_like,
    _specialization_like,
    _all
  }: {
    gender?: string[]
    status?: number[]
    date_of_birth?: Date[]
    created_at?: Date[]
    _name_like?: string
    _specialization_like?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            ...(status && { status: { in: status } }),
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
              role: 4
            },
            OR: [{ specialization: { contains: _all } }, { user: { name: { contains: _all } } }]
          }
        : {
            ...(status && { status: { in: status } }),
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
              role: 4
            },
            ...(_specialization_like && {
              specialization: {
                contains: _specialization_like
              }
            })
          }
    })
  }

  async updateStaffProfile(staff_id: string, payload: UpdateStaffProfileReqBody) {
    const { specialization } = payload
    return this.model.update({
      where: { id: staff_id },
      data: {
        specialization: specialization as string,
        user: {
          update: {
            updated_at: new Date()
          }
        }
      }
    })
  }

  async getNumberOfStaff() {
    return this.model.count({
      where: {
        user: {
          verify: 0,
          role: 4
        },
        status: 1
      }
    })
  }

  async getStaffByIndex(index: number) {
    const staff = await this.model.findMany({
      orderBy: {
        id: 'asc'
      },
      skip: index,
      take: 1,
      select: {
        id: true
      }
    })
    return staff[0].id
  }
}
