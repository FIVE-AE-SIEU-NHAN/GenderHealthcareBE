import Bull from 'bull'

const redisOptions = {
  redis: {
    host: 'redis-16859.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    port: 16859,
    password: 'DBQcCiwTFq1jkHkUj7IFxaGYVjczZe3f'
  }
}

export const notificationQueue = new Bull('notificationQueue', redisOptions)

export const paymentQueue = new Bull('paymentQueue', redisOptions)

export const cycleQueue = new Bull('cycleQueue', redisOptions)
