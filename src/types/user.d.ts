import { USER_ROLE } from '../constants/role.enum'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: USER_ROLE
      }
    }
  }
}
