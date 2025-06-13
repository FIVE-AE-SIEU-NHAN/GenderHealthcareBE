import { Request, Response, NextFunction } from 'express'
import { USER_ROLE } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'

export const requireRole = (...allowedRoles: USER_ROLE[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.decode_authorization as any

    if (!allowedRoles.includes(user.role)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: USERS_MESSAGES.PERMISSION_DENIED
      })
    }

    next()
  }
}
