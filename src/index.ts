import express from 'express'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import usersRouter from './routers/user/user.routers'
import adminUserRoute from './routers/user/admin.users.router'
import questionRouter from './routers/question/question.routers'
import managerQuestionRouter from './routers/question/manager.question.router'
import consultantRouter from './routers/consultant/consultant.router'
import managerConsultantRouter from './routers/consultant/manager.consultant.routers'
import appointmentRouter from './routers/appointment/appointment.router'
import blogRouter from './routers/blog/blog.routers'
import staffBlogRouter from './routers/blog/staff.blog.routers'
import managerBlogRouter from './routers/blog/manager.blog.routers'
import './bull/notificationProcessor.bull'
import { createServer } from 'http'
import socketService from './socket/socket'
import dotenv from 'dotenv'
import cycleRouter from './routers/cycle/cycle.routers'
dotenv.config()
// ---------------------------     SERVER    --------------------------- //
const port = 3000
const app = express()

// ---------------------------      CORS     --------------------------- //
app.use(
  cors({
    origin: process.env.FE_URL,
    credentials: true
  })
)

// ---------------------------   DATABASE    --------------------------- //
// kết nối database
prismaService.connect()
redisService.connect()

// ---------------------------     ROUTER    --------------------------- //
// cấu hình body parser
app.use(express.json())

app.use('/user', usersRouter, adminUserRoute)
app.use('/question', questionRouter, managerQuestionRouter)
app.use('/consultant', consultantRouter, managerConsultantRouter)
app.use('/appointment', appointmentRouter)
app.use('/blog', blogRouter, staffBlogRouter, managerBlogRouter)
app.use('/cycle', cycleRouter)
// --------------------------- ERORR HANDLER --------------------------- //
app.use(defaultErorHandler)

// ---------------------------   SOCKET IO   --------------------------- //
// Khởi tạo Socket.IO server
const serverHttp = createServer(app)
socketService.init(serverHttp)

// ---------------------------   RUN SERVER  --------------------------- //
serverHttp.listen(port, () => {
  const port = 3000
  console.log(`\x1b[34mPROJECT GenderHealthcareBE OPEN ON PORT: \x1b[31m${port}\x1b[0m`)
})

// TODO:
// chưa test user online
// api xem thông báo, trả về số lượng thông báo chưa đọc
// api đánh dấu thông báo đã đọc

// *** đã tạo bảng staff thì chuyển user_id trong blogs thành staff_id
