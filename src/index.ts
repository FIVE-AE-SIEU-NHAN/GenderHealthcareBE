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
import { createServer } from 'http'
import socketService from './socket/socket'
import { notificationQueue } from './bull/queue'
import redisUtils from './utils/redis'

// ---------------------------      BULL     --------------------------- //
import './bull/worker'

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

// 🧪 API test: Thêm job gửi thông báo vào hàng đợi BullMQ
app.get('/test', async (req, res) => {
  const user_id = '1fe57d3b-4808-11f0-bfde-0242ac110002'
  const notification_id = '1fe57d3b-4808-11f0-bfde-0242ac110002'
  const content = 'Đây là thông báo test 1'
  await notificationQueue.add(
    'notification-for-customer',
    {
      user_id,
      notification_id,
      content
    },
    {
      delay: 5000,
      removeOnComplete: true
    }
  )

  // socketService.sendNotification(user_id, notification_id, content)

  res.status(200).json({
    message: 'Test notification queue successfully!'
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
  console.log(`\x1b[34mPROJECT GenderHealthcareBE OPEN ON PORT: \x1b[31m${port}\x1b[0m`)
})
