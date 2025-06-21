import { Server, Socket } from 'socket.io'

export default function initChatSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('New client:', socket.id)

    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`${socket.id} joined room ${roomId}`)
    })

    socket.on('send-message', ({ roomId, message }) => {
      socket.to(roomId).emit('receive-message', {
        message,
        sender: socket.id
      })
    })
  })
}
