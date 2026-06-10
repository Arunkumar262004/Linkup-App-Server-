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

const userSockets = new Map() // userId string -> Set of socket.ids

io.on('connection', async (socket) => {
    // Add to userSockets map
    const userIdStr = socket.userId.toString()
    if (!userSockets.has(userIdStr)) {
      userSockets.set(userIdStr, new Set())
    }
    userSockets.get(userIdStr).add(socket.id)

    await userSvc.updateOnlineStatus(socket.userId, true)

    // Mark pending messages sent to this user as 'delivered'
    try {
      const Chat = require('../models/Chat.model')
      const Message = require('../models/Message.model')

      const chats = await Chat.find({ members: socket.userId })
      const chatIds = chats.map(c => c._id)

      await Message.updateMany(
        { chatId: { $in: chatIds }, senderId: { $ne: socket.userId }, status: 'sent' },
        { $set: { status: 'delivered' } }
      )

      chatIds.forEach(chatId => {
        socket.to(chatId.toString()).emit('messages_delivered', { chatId: chatId.toString() })
      })
    } catch (err) {
      console.error('Delivering pending messages error:', err)
    }

    socket.on('join_room', (chatId) => socket.join(chatId))

    socket.on('send_message', async (data) => {
      try {
        const Chat = require('../models/Chat.model')
        const chat = await Chat.findById(data.chatId)
        if (chat) {
          chat.members.forEach(memberId => {
            const memberIdStr = memberId.toString()
            const socketIds = userSockets.get(memberIdStr)
            if (socketIds) {
              socketIds.forEach(sid => {
                if (sid !== socket.id) {
                  io.to(sid).emit('receive_message', data)
                }
              })
            }
          })
        }
      } catch (err) {
        console.error('Error broadcasting message:', err)
      }
    })

    socket.on('read_chat', async ({ chatId }) => {
      try {
        const Message = require('../models/Message.model')
        await Message.updateMany(
          { chatId, senderId: { $ne: socket.userId }, status: { $ne: 'read' } },
          { $set: { status: 'read' } }
        )
        // Broadcast that messages have been read
        socket.to(chatId).emit('messages_read', { chatId })
      } catch (err) {
        console.error('Reading chat error:', err)
      }
    })

    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', { userId: socket.userId })
    })

    socket.on('stop_typing', ({ chatId }) => {
      socket.to(chatId).emit('user_stop_typing', { userId: socket.userId })
    })

    socket.on('disconnect', async () => {
      const sockets = userSockets.get(userIdStr)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userIdStr)
          await userSvc.updateOnlineStatus(socket.userId, false)
        }
      }
    })
  })

  return io
}

const getIO = () => {
  if (!io) throw new Error('Socket not initialised')
  return io
}

module.exports = { initSocket, getIO }