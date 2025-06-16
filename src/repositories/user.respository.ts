import { Topic, Users as User } from '@prisma/client'
import { CreateUserReqBody, RegisterReqBody, UpdateProfileReqBody } from '~/models/requests/users.requests'
import { prisma } from '~/services/client'
import { hashPassword } from '~/utils/crypto'
class UserRepository {
  private model = prisma.users

  async checkEmailExist(email: string) {
    return await this.model.findUnique({ where: { email } })
  }

  async updateUserHaveGoogleId(email: string, userData: RegisterReqBody) {
    return this.model.update({
      where: { email },
      data: {
        name: userData.name,
        password: userData.password,
        gender: userData.gender,
        phone_number: userData.phone_number,
        date_of_birth: new Date(userData.date_of_birth),
        updated_at: new Date()
      }
    })
  }

  async checkLogin(email: string, password: string): Promise<User | null> {
    const hashedPassword = hashPassword(password)
    return this.model.findFirst({
      where: {
        email,
        password: hashedPassword
      }
    })
  }

  async createUser(userData: User): Promise<User> {
    return this.model.create({ data: userData })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } })
  }

  async updatePasswordById(user_id: string, password: string) {
    return this.model.update({
      where: { id: user_id },
      data: { password }
    })
  }

  async findUserById(
    id: string
  ): Promise<Pick<
    User,
    'id' | 'email' | 'name' | 'google_id' | 'date_of_birth' | 'gender' | 'password' | 'phone_number'
  > | null> {
    return this.model.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        date_of_birth: true,
        gender: true,
        password: true,
        phone_number: true,
        google_id: true
      }
    })
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } })
  }

  async updateGoogleId(email: string, google_id: string) {
    return this.model.update({
      where: { email },
      data: { google_id }
    })
  }

  async updateUserProfile(
    user_id: string,
    payload: UpdateProfileReqBody
  ): Promise<Pick<
    User,
    'id' | 'email' | 'name' | 'google_id' | 'date_of_birth' | 'gender' | 'password' | 'phone_number'
  > | null> {
    return this.model.update({
      where: { id: user_id },
      data: {
        ...payload,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        date_of_birth: true,
        gender: true,
        password: true,
        phone_number: true,
        google_id: true
      }
    })
  }

  async getUserRoleById(user_id: string) {
    const user = await this.model.findUnique({
      where: { id: user_id },
      select: { role: true }
    })

    return user?.role
  }

  async getUsersForAdmin({
    limit,
    _skip,
    _sort,
    _order,
    verify,
    role,
    gender,
    date_of_birth,
    created_at,
    _name_like,
    _email_like,
    _phone_number_like,
    _all
  }: {
    limit: number
    _skip: number
    _sort?: string
    _order?: string
    verify?: number[]
    role?: number[]
    gender?: string[]
    date_of_birth?: Date[]
    created_at?: Date[]
    _name_like?: string
    _email_like?: string
    _phone_number_like?: string
    _date_of_birth?: string
    _all?: string
  }) {
    console.log('role', role)
    return this.model.findMany({
      where: _all
        ? {
            ...(role && { role: { in: role } }),
            ...(verify && { verify: { in: verify } }),
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
                lte: `${created_at[1].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            OR: [{ name: { contains: _all } }, { email: { contains: _all } }, { phone_number: { contains: _all } }]
          }
        : {
            ...(role && { role: { in: role } }),
            ...(verify && { verify: { in: verify } }),
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
                lte: `${created_at[1].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            ...(_name_like && {
              name: {
                contains: _name_like
              }
            }),
            ...(_email_like && {
              email: {
                contains: _email_like
              }
            }),
            ...(_phone_number_like && {
              phone_number: {
                contains: _phone_number_like
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

  async countUsersForAdmin({
    verify,
    role,
    gender,
    date_of_birth,
    created_at,
    _name_like,
    _email_like,
    _phone_number_like,
    _all
  }: {
    verify?: number[]
    role?: number[]
    gender?: string[]
    date_of_birth?: Date[]
    created_at?: Date[]
    _name_like?: string
    _email_like?: string
    _phone_number_like?: string
    _date_of_birth?: string
    _all?: string
  }) {
    return this.model.count({
      where: _all
        ? {
            ...(role && { role: { in: role } }),
            ...(verify && { verify: { in: verify } }),
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
                lte: `${created_at[1].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            OR: [{ name: { contains: _all } }, { email: { contains: _all } }, { phone_number: { contains: _all } }]
          }
        : {
            ...(role && { role: { in: role } }),
            ...(verify && { verify: { in: verify } }),
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
                lte: `${created_at[1].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            ...(created_at?.length === 1 && {
              created_at: {
                gte: `${created_at[0].toISOString().split('T')[0]}T00:00:00.000Z`,
                lte: `${created_at[0].toISOString().split('T')[0]}T11:59:59.999Z`
              }
            }),
            ...(_name_like && {
              name: {
                contains: _name_like
              }
            }),
            ...(_email_like && {
              email: {
                contains: _email_like
              }
            }),
            ...(_phone_number_like && {
              phone_number: {
                contains: _phone_number_like
              }
            })
          }
    })
  }

  async getUserStatus(id: string) {
    return this.model.findUnique({
      where: { id },
      select: { verify: true }
    })
  }

  async updateStatusUser(id: string, status: number) {
    return this.model.update({
      where: { id },
      data: { verify: status, updated_at: new Date() }
    })
  }

  async createUserByAdmin(data: {
    id: string
    name: string
    email: string
    date_of_birth: Date
    phone_number: string
    gender: string
    password: string
    created_at: Date
    updated_at: Date
    verify: number
    role: number
  }) {
    return this.model.create({ data })
  }
}

export default UserRepository
