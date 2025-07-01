import { notificationQueue } from './queue'

notificationQueue.process('notification-for-customer', async (job) => {
  const { user_id, content } = job.data
  console.log(`📢 Gửi thông báo tới ${user_id}: ${content}`)
})
