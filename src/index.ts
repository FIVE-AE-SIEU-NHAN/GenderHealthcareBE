import express from 'express'
import usersRouter from './routers/user.routers'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import questionRouter from './routers/question.routers'
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

app.use('/user', usersRouter)
app.use('/question', questionRouter)

// error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
