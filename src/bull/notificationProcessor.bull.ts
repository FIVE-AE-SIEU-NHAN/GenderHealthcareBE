import socketService from '~/socket/socket'
import { notificationQueue } from './notificationQueue.bull'

notificationQueue.process('send-noti-of-cosultant-booking', async (job) => {
  const { user_id, appointment_id, content } = job.data
  socketService.sendNotification(user_id, appointment_id, content)
})
