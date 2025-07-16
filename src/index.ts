import express from 'express'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import usersRouter from './routers/user/user.routers'
import adminUserRoute from './routers/user/admin.users.router'
import questionRouter from './routers/question/question.routers'
import managerQuestionRouter from './routers/question/manager.question.router'
import consultantRouter from './routers/consultant/consultant.routers'
import managerConsultantRouter from './routers/consultant/manager.consultant.routers'
import appointmentRouter from './routers/appointment/appointment.router'
import blogRouter from './routers/blog/blog.routers'
import staffBlogRouter from './routers/blog/staff.blog.routers'
import managerBlogRouter from './routers/blog/manager.blog.routers'
import notificationRouter from './routers/notification/notification.routers'
import paymentServices from './services/payment.services'
import paymentRoute from './routers/payment.routers'
import { createServer } from 'http'
import socketService from './socket/socket'

// ---------------------------      BULL     --------------------------- //
import './bull/worker'
import { paymentQueue } from './bull/queue'

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
app.use('/notification', notificationRouter)
app.use('/payment', paymentRoute)

// --------------------------- 🧪 API TEST ----------------------------- //
app.get('/test', async (req, res) => {
  const user_id = '123'
  const result = {
    orderCode: 'order123',
    amount: 1000,
    user_id
  }

  paymentQueue.add(
    'cancel-payment-after-15-minutes',
    {
      user_id,
      orderCode: result.orderCode.toString()
    },
    {
      delay: 15 * 60 * 1000,
      jobId: result.orderCode,
      removeOnComplete: true
    }
  )

  res.status(200).json({
    message: 'Test API is working'
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

// TODO:
