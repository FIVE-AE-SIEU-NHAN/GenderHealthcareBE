import { Server, Socket } from 'socket.io'
import http from 'http'
import redisUtils from '~/utils/redis'
import MessageRepository from '~/repositories/message.repository'
import { PaymentStatus } from '@prisma/client'

class SocketService {
  private static instance: SocketService
  private io: Server | null = null
  private messageRepository: MessageRepository

  private constructor() {
    this.messageRepository = new MessageRepository()
  }

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
      this.joinUserRoom(socket, user_id)
      // this.joinChatRoom(socket)
      // this.chatMessage(socket)
      // this.typing(socket)
      // this.leaveRoom(socket)

      // event disconnect
      socket.on('disconnect', (reason) => {
        console.log(
          `- Socket \x1b[31m${socket.id}\x1b[0m disconnected. Reason: \x1b[32m${reason.toLocaleUpperCase()}\x1b[0m`
        )
        redisUtils.removeOnlineSocket(user_id, socket.id)
      })
    })
  }

  private joinUserRoom(socket: Socket, user_id: string) {
    socket.join(user_id)
    console.log(`- Socket \x1b[31m${socket.id}\x1b[0m joined room: \x1b[36m${user_id}\x1b[0m`)
  }

  // Gửi thông báo tới người dùng
  sendNotification(user_id: string, notification_id: string, content: string) {
    this.getIO().to(user_id).emit('notify:send', {
      notification_id,
      content
    })
  }

  // Gửi trạng thái thanh toán
  sendStatusPayment(user_id: string, status: PaymentStatus, content: string) {
    this.getIO().to(user_id).emit('payment:status', {
      status,
      content
    })
  }

  // Tin nhắn
  // private joinChatRoom(socket: Socket) {
  //   socket.on('chat:joinRoom', (room_id: string) => {
  //     socket.join(room_id)
  //     console.log(`- Socket ${socket.id} joined chat room: ${room_id}`)
  //   })
  // }

  // private chatMessage(socket: Socket) {
  //   socket.on('chat:message', async ({ room_id, sender_id, message }) => {
  //     console.log(`Message from ${sender_id} in room ${room_id}: ${message}`)

  //     try {
  //       // 1. Lưu vào database
  //       const newMessage = await this.messageRepository.createMessage(room_id, sender_id, message)

  //       // 2. Phát tới những client khác (ngoại trừ người gửi)
  //       socket.to(room_id).emit('chat:message', {
  //         id: newMessage.id,
  //         sender_id,
  //         content: message,
  //         created_at: newMessage.created_at
  //       })
  //     } catch (error) {
  //       socket.emit('chat:message:error', {
  //         error: 'Không thể gửi tin nhắn.'
  //       })
  //     }
  //   })
  // }

  // private typing(socket: Socket) {
  //   socket.on('chat:typing', ({ room_id, sender_id, is_typing }) => {
  //     socket.to(room_id).emit('chat:typing', { sender_id, is_typing })
  //   })
  // }

  // private leaveRoom(socket: Socket) {
  //   socket.on('chat:leaveRoom', (room_id: string) => {
  //     socket.leave(room_id)
  //     console.log(`- Socket ${socket.id} left chat room: ${room_id}`)
  //   })
  // }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket not initialized')
    }
    return this.io
  }
}

const socketService = SocketService.getInstance()
export default socketService
