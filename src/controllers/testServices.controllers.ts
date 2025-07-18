import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import testServiceServices from '~/services/testService.services'

export const getTestServicePacketController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const result = await testServiceServices.getAllTestPackageServices()

  res.status(HTTP_STATUS.OK).json({
    message: 'Test service packets retrieved successfully',
    result
  })
}
