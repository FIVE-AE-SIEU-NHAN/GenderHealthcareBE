import { Response, Request, NextFunction } from 'express'
import { pick } from 'lodash'

export const filterMiddlewares = <T>(filterKeys: Array<keyof T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
}
