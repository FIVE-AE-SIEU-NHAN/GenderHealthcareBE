import Bull from 'bull'

const redisOptions = {
  redis: {
    host: '159.65.128.97',
    port: 6379,
    password: 'Maihankiet.2004'
  }
}

export const notificationQueue = new Bull('notificationQueue', redisOptions)

export const paymentQueue = new Bull('paymentQueue', redisOptions)

export const cycleQueue = new Bull('cycleQueue', redisOptions)
