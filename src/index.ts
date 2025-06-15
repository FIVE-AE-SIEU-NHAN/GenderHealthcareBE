import express from 'express'
import usersRouter from './routers/user.routers'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import questionRouter from './routers/question.routers'
import adminQuestionRouter from './routers/admin/admin.question.router'
import adminUserRoute from './routers/admin/admin.users.router'
import adminConsultantRouter from './routers/admin/amdin.consultant.router'
const app = express()
const port = 3000

// cấu hình cors
app.use(
  cors({
    origin: process.env.FE_URL,
    credentials: true
  })
)

// kết nối database
prismaService.connect()
redisService.connect()

// cấu hình body parser
app.use(express.json())

app.use('/user', usersRouter, adminUserRoute)
app.use('/question', questionRouter, adminQuestionRouter)
app.use('/consultant', adminConsultantRouter)

// error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
