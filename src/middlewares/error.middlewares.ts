// file này chứa hàm xử lý lỗi của toàn bộ server
// lỗi của validate trả về sẽ có các dạng sau:
//          EntityError {status, message, error}
//          ErrorWithStatus {status, message, error}
// lỗi cuẩ controller trả về:
//          ErrorWithStatus {status, message, error}
//          error bình thường {message, stack, name}  (lỗi rớt mạng)
// => lỗi từ mọi nơi đổ về chưa chắc có status

import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { Request, Response, NextFunction } from 'express'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // lỗi của toàn bộ hệ thống đổ về đây
  console.log(error);
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    // lỗi khác ErrorWithStatus, nghĩa là lỗi bth, lỗi kh có status,
    // lỗi có tùm lum thứ stack, name, kh có status
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, {
        enumerable: true
      })
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      errorInfor: omit(error, ['stack'])
    })
  }
}
