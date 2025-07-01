// Import lớp Server & Socket từ socket.io (cho server-side WebSocket)
import { Server, Socket } from 'socket.io'
// Import module HTTP của Node.js để dùng với express
import http from 'http'
import redisUtils from '~/utils/redis'

class SocketService {
  private static instance: SocketService
  private io: Server | null = null

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public init(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket: Socket) => {
      console.log(`>>> Socket connected: \x1b[31m${socket.id}\x1b[0m`)
      const user_id = socket.handshake.auth.userId as string

      // thêm trạng thái người dùng online
      redisUtils.addOnlineUser(user_id, socket.id)

      // các event chính
      this.joinRoom(socket, user_id)

      // event disconnect
      socket.on('disconnect', (reason) => {
        console.log(
          `- Socket \x1b[31m${socket.id}\x1b[0m disconnected. Reason: \x1b[32m${reason.toLocaleUpperCase()}\x1b[0m`
        )
        redisUtils.removeOnlineSocket(user_id, socket.id)
      })
    })
  }

  private joinRoom(socket: Socket, user_id: string) {
    socket.join(user_id)
    console.log(`- Socket \x1b[31m${socket.id}\x1b[0m joined room: \x1b[36m${user_id}\x1b[0m`)
  }

  sendNotification(user_id: string, appointment_id: string, content: string) {
    this.getIO().to(user_id).emit('notify:send', {
      appointment_id,
      content
    })
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket not initialized')
    }
    return this.io
  }
}

const socketService = SocketService.getInstance()
export default socketService
