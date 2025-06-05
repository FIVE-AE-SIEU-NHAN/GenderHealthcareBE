import { Request, Response, NextFunction } from 'express'

export const ensureRoles = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user || typeof user.role === 'undefined') {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập.' })
    }

    const userRole = Number(user.role)

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' })
    }

    next()
  }
}
