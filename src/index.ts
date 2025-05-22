import express from 'express'
import usersRouter from './routers/user.routers'
import databaseService from './services/database.services'
import { defaultErorHandler } from './middlewares/error.middlewares'
import otpRouter from './routers/otp.routers'
import redisService from './services/redis.services'
import cors from 'cors'
const app = express()
const port = 3000

// kết nối database
databaseService.connect()
redisService.connect()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/user', usersRouter)
app.use('/email', emailRouter)

// error handler
app.use(defaultErorHandler)

// user route
app.use('/user', usersRouter)
// otp route
app.use('/otp', otpRouter)

// error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
