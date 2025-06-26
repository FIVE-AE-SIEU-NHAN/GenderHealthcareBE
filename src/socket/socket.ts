// Import lớp Server & Socket từ socket.io (cho server-side WebSocket)
import { Server, Socket } from 'socket.io'
// Import module HTTP của Node.js để dùng với express
import http from 'http'

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
      console.log(`Socket connected: ${socket.id}`)
      const user_id = socket.handshake.auth.userId as string

      // các event chính
      this.joinRoom(socket, user_id)

      // event disconnect
      socket.on('disconnect', (reason) => {
        console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`)
      })
    })
  }

  private joinRoom(socket: Socket, user_id: string) {
    socket.join(user_id)
    console.log(`Socket ${socket.id} joined room: ${user_id}`)
  }

  sendNotification(user_id: string, appointment_id: string, content: string) {
    console.log(content)
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
