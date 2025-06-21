import express from 'express'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
import usersRouter from './routers/user/user.routers'
import adminUserRoute from './routers/user/admin.users.router'
import questionRouter from './routers/question/question.routers'
import adminQuestionRouter from './routers/question/admin.question.router'
import consultantRouter from './routers/consultant/consultant.router'
import managerConsultantRouter from './routers/consultant/manager.consultant.routers'
import appointmentRouter from './routers/appointment/appointment.router'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const port = 3000

// const server = createServer(app)
// const io = new Server(server, {
//   cors: { origin: '*' }
// })

// console.log('🚀 Initializing Socket.IO...')
// io.on('connection', (socket) => {
//   console.log('✅ Client connected:', socket.id)

//   socket.on('join_room', (roomId) => {
//     socket.join(roomId)

//     const room = io.sockets.adapter.rooms.get(roomId)
//     const numClients = room ? room.size : 0

//     console.log(`🧑‍💼 Client ${socket.id} joined room ${roomId}. Total: ${numClients}`)

//     io.to(roomId).emit('room_status', {
//       roomId,
//       clients: numClients
//     })
//   })

//   socket.on('send_message', ({ roomId, message }) => {
//     console.log('📨 Message received from', socket.id, ':', message)

//     io.to(roomId).emit('receive_message', {
//       message,
//       from: socket.id,
//       timestamp: new Date().toISOString()
//     })
//   })

//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id)
//   })
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
app.use('/question', questionRouter, adminQuestionRouter)
app.use('/consultant', consultantRouter, managerConsultantRouter)
app.use('/appointment', appointmentRouter)

// error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
