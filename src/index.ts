import express from 'express'
import usersRouter from './routers/user.routers'
import { defaultErorHandler } from './middlewares/error.middlewares'
import otpRouter from './routers/otp.routers'
import redisService from './utils/redis'
import cors from 'cors'
import databaseService from './services/database.services'
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
databaseService.connect()
redisService.connect()

// cấu hình body parser
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello world')
})

// user route
app.use('/user', usersRouter)
// // otp route
app.use('/otp', otpRouter)

// // error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
