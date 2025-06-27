import express from 'express'
import { USER_ROLE } from '~/constants/enums'
import { requireRole } from '~/middlewares/decentralization .middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const managerBlogRouter = express.Router()

managerBlogRouter.get('/manager/test', (req, res) => {
  res.status(200).json({
    message: 'Manager blog router is working'
  })
})

export default managerBlogRouter
