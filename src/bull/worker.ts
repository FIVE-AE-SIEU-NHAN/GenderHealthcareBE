import redisUtils from '~/utils/redis'
import { notificationQueue } from './queue'
import notificationServices from '~/services/notification.services'
import socketService from '~/socket/socket'

notificationQueue.process('notification-for-customer', async (job) => {
  const { user_id, notification_id, content } = job.data
  const isOnline = await redisUtils.isUserOnline(user_id)
  if (isOnline) {
    socketService.sendNotification(user_id, notification_id, content)
  }

  console.log('>>> ', notification_id)

  await notificationServices.updateNotificationSendStatus(notification_id)
})

console.log('\x1b[33mWorker\x1b[0m is running and listening for jobs...')
