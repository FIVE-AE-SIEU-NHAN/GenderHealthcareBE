import express from 'express'
import usersRouter from './routers/user.routers'
import databaseService from './services/database.services'
import emailRouter from './routers/email.routers'
import { defaultErorHandler } from './middlewares/error.middlewarres'

const app = express()
const port = 3000

// kết nối database
databaseService.connect()

app.use(express.json())

// route
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/user', usersRouter)
app.use('/email', emailRouter)

// error handler
app.use(defaultErorHandler)

app.listen(port, () => {
  console.log(`PROJECT GenderHealthcareBE OPEN ON PORT: ${port}`)
})
