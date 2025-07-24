import express from 'express'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import usersRouter from './routers/user/user.routers'
import adminUserRoute from './routers/user/admin.users.routers'
import questionRouter from './routers/question/question.routers'
import managerQuestionRouter from './routers/question/manager.question.routers'
import consultantRouter from './routers/consultant/consultant.routers'
import managerConsultantRouter from './routers/consultant/manager.consultant.routers'
import appointmentRouter from './routers/appointment/appointment.routers'
import blogRouter from './routers/blog/blog.routers'
import staffBlogRouter from './routers/blog/staff.blog.routers'
import managerBlogRouter from './routers/blog/manager.blog.routers'
import notificationRouter from './routers/notification/notification.routers'
import paymentRoute from './routers/payment.routers'
import { createServer } from 'http'
import socketService from './socket/socket'
import { paymentQueue } from './bull/queue'
import testServiceRouter from './routers/testService/testService.routers'
import staffRouter from './routers/staff/staff.routers'
import managerStaffRouter from './routers/staff/manager.staff.routers'
import testServiceServices from './services/testService.services'
import { TimeSlot } from '@prisma/client'
import usersServices from './services/users.services'
import redisUtils from './utils/redis'
import managerTestServiceRouter from './routers/testService/manager.testService.routers'
import chatBotRouter from './routers/chatBot.router'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import * as YAML from 'yaml'

// ---------------------------      BULL     --------------------------- //
import './bull/worker'

// ---------------------------   SWAGGER    --------------------------- //
const file = fs.readFileSync(path.resolve('swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/user', usersRouter, adminUserRoute)
app.use('/question', questionRouter, managerQuestionRouter)
app.use('/consultant', consultantRouter, managerConsultantRouter)
app.use('/appointment', appointmentRouter)
app.use('/blog', blogRouter, staffBlogRouter, managerBlogRouter)
app.use('/notification', notificationRouter)
app.use('/payment', paymentRoute)
app.use('/test-service', testServiceRouter, managerTestServiceRouter)
app.use('/staff', staffRouter, managerStaffRouter)
app.use('/chatbot', chatBotRouter)

// --------------------------- 🧪 API TEST ----------------------------- //
app.get('/test', async (req, res) => {
  const numberOfStaff = await usersServices.getNumberOfStaff()
  console.log(numberOfStaff)
  if (!numberOfStaff) {
    console.log('Lỗi')
  }

  // kiểm tra xem có staff nào rảnh không
  const startIndex = await redisUtils.getIndexNextStaff(numberOfStaff)
  let selectedStaffId = ''

  for (let i = 0; i < numberOfStaff; i++) {
    const currentIndex = (startIndex + i) % numberOfStaff

    // lấy staff theo index
    const staff_id = await usersServices.getStaffByIndex(currentIndex)

    // kiểm tra xem staff có lịch hẹn nào trùng với booking_date và time_slot không
    const time_slot = TimeSlot.SLOT_07_08
    const isBusy = await testServiceServices.checkTestServiceAppointmentExists(staff_id, new Date(), time_slot)

    if (!isBusy) {
      await redisUtils.setNextStaffIndex(currentIndex + 1)
      selectedStaffId = staff_id
      break
    }
  }

  res.status(200).json({
    message: 'Test API is working',
    selectedStaffId
  })
})

app.get('/test2', async (req, res) => {
  const job = await paymentQueue.getJob('order123')
  job && (await job.remove())

  res.status(200).json({
    message: 'Test API2 is working'
  })
})

// --------------------------- ERROR HANDLER --------------------------- //
app.use(defaultErorHandler)

// ---------------------------   SOCKET IO   --------------------------- //
// Khởi tạo Socket.IO server
const serverHttp = createServer(app)
socketService.init(serverHttp)
console.log('\x1b[35mSocket.IO\x1b[0m is running...')

// ---------------------------   RUN SERVER  --------------------------- //
serverHttp.listen(port, () => {
  console.log(`\x1b[34mPROJECT GenderHealthcareBE OPEN ON PORT: \x1b[31m${port}\x1b[0m`)
})
