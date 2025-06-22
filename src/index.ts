import express from 'express'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import usersRouter from './routers/user/user.routers'
import adminUserRoute from './routers/user/admin.users.router'
import questionRouter from './routers/question/question.routers'
import consultantRouter from './routers/consultant/consultant.router'
import managerConsultantRouter from './routers/consultant/manager.consultant.routers'
import appointmentRouter from './routers/appointment/appointment.router'
import { createServer } from 'http'
import { Server } from 'socket.io'
import initChatSocket from './socket/chat.socket'

const port = 3000
const app = express()
const serverHttp = createServer(app)

// Khởi tạo Socket.IO server
// const io = new Server(serverHttp, {
//   cors: {
//     origin: '*'
//   }
// })

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
app.use('/question', questionRouter, managerConsultantRouter)
app.use('/consultant', consultantRouter, managerConsultantRouter)
app.use('/appointment', appointmentRouter)

// socket.io
// initChatSocket(io)

// error handler
app.use(defaultErorHandler)

serverHttp.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
