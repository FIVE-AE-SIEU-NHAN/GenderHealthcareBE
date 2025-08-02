import Bull from 'bull'

const redisOptions = {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
  }
}

export const notificationQueue = new Bull('notificationQueue', redisOptions)

export const paymentQueue = new Bull('paymentQueue', redisOptions)

export const cycleQueue = new Bull('cycleQueue', redisOptions)
