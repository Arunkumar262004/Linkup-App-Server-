const { Server } = require('socket.io')
const jwt        = require('jsonwebtoken')
const userSvc    = require('../services/user.service')

let io

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  // Auth middleware — verify JWT before allowing connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))
    try {
      socket.userId = jwt.verify(token, process.env.JWT_SECRET).id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    await userSvc.updateOnlineStatus(socket.userId, true)

    socket.on('join_room', (chatId) => socket.join(chatId))

    socket.on('send_message', (data) => {
      // Broadcast to everyone in the room except the sender
      socket.to(data.chatId).emit('receive_message', data)
    })

    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', { userId: socket.userId })
    })

    socket.on('stop_typing', ({ chatId }) => {
      socket.to(chatId).emit('user_stop_typing', { userId: socket.userId })
    })

    socket.on('disconnect', async () => {
      await userSvc.updateOnlineStatus(socket.userId, false)
    })
  })

  return io
}

const getIO = () => {
  if (!io) throw new Error('Socket not initialised')
  return io
}

module.exports = { initSocket, getIO }