import { RequestHandler } from 'express'

export const ensureRoles = (...allowedRoles: number[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user

    if (!user || typeof user.role === 'undefined') {
      res.status(401).json({ message: 'Bạn chưa đăng nhập.' })
      return
    }

    const userRole = Number(user.role)

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' })
      return
    }

    next()
  }
}

