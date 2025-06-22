import { Server, Socket } from 'socket.io'

// Nếu sau này cần quản lý user theo socket, có thể dùng map này
const userSocketMap = new Map<string, string>() // userId -> socket.id

export default function initChatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)
    /* =====================CHAT=========================== */
    // socket.on('join-room', (roomId: string) => {
    //   if (!roomId) return

    //   // Cho socket này tham gia vào room có ID là roomId
    //   socket.join(roomId)
    //   // Lưu lại thông tin room vào trong socket (có thể dùng sau này, ví dụ khi gửi hoặc rời phòng)
    //   socket.data.roomId = roomId

    //   console.log(`User ${socket.id} joined room ${roomId}`)
    // })

    // Lắng nghe gửi tin nhắn
    socket.on('chat-message', ({ roomId, message, sender }) => {
      if (!roomId || !message) return

      console.log(`Message from ${sender || 'unknown'} in room ${roomId}: ${message}`)

      // Gửi đến các client khác trong cùng room
      socket.to(roomId).emit('chat-message', { sender, message })
    })

    /* =====================VIDEO CALL=========================== */
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
    })

    socket.on('start-call', (roomId) => {
      socket.to(roomId).emit('start-call')
    })

    socket.on('offer', ({ room, offer }) => {
      socket.to(room).emit('offer', offer)
    })

    socket.on('answer', ({ room, answer }) => {
      socket.to(room).emit('answer', answer)
    })

    socket.on('ice-candidate', ({ room, candidate }) => {
      socket.to(room).emit('ice-candidate', { candidate })
    })

    /* ================================================ */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)

      // Nếu dùng userSocketMap sau này:
      // userSocketMap.forEach((sId, uId) => {
      //   if (sId === socket.id) userSocketMap.delete(uId)
      // })
    })
  })
}
