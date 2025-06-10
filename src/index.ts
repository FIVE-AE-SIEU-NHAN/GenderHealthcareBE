import express from 'express'
import usersRouter from './routers/user.routers'
import { defaultErorHandler } from './middlewares/error.middlewares'
import redisService from './utils/redis'
import cors from 'cors'
import prismaService from './services/prisma.services'
const app = express()
const port = 3000

// cấu hình cors
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

// kết nối database
prismaService.connect()
redisService.connect()

// cấu hình body parser
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello world')
})

// user route
app.use('/user', usersRouter)

// error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
