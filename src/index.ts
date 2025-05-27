import express from 'express'
import cors from 'cors'
import path from 'path'

// Routers
import usersRouter from './routers/user.routers'
import otpRouter from './routers/otp.routers'
import blogRoutes from './routers/blog.routes'

// Middlewares
import { defaultErorHandler } from './middlewares/error.middlewares'

// Services
import redisService from './utils/redis'
import databaseService from './services/database.services'

const app = express()
const port = 3000

// ===== CORS config =====
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Connect database + redis =====
databaseService.connect()
redisService.connect()

// ===== Test route =====
app.get('/', (req, res) => {
  res.send('Hello Gender Healthcare Backend!')
})

// ===== Routes =====
app.use('/user', usersRouter)
app.use('/otp', otpRouter)
app.use('/api', blogRoutes) // blog routes go under /api

// ===== Error handler =====
app.use(defaultErorHandler)

// ===== Start server =====
app.listen(port, () => {
  console.log(`🚀 GenderHealthcareBE is running at http://localhost:${port}`)
})
