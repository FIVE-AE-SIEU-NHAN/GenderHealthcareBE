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
import './bull/notificationProcessor.bull'
import { createServer } from 'http'
import socketService from './socket/socket'
import { TimeSlot } from '@prisma/client'

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
app.post('/test', (req, res) => {
  const { time_slot, booking_date } = req.body
  const timeSlotStartMap: Record<TimeSlot, string> = {
    SLOT_08_10: '09:07',
    SLOT_10_12: '10:00',
    SLOT_13_15: '13:00',
    SLOT_15_17: '23:00'
  }

  const time = timeSlotStartMap[time_slot as TimeSlot]
  const now = new Date()
  const date_time = new Date(`${booking_date}T${time}:00`)

  console.log(date_time)

  const delay = date_time.getTime() - now.getTime() - 30 * 60 * 1000

  res.status(200).json({
    message: 'Welcome to GenderHealthcareBE API',
    delay,
    now,
    date_time
  })
})

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
// done gửi lịch lưu redis
// kiểm tra trạng thái customer có online không
// nếu online thì gửi thông báo qua socket io
// nếu không online thì lưu vào redis và gửi thông báo sau
