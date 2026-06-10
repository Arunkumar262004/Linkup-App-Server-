const Chat    = require('../models/Chat.model')
const Message = require('../models/Message.model')

// Get or create a DM between two users
const getOrCreateDM = async (userA, userB) => {
  let chat = await Chat.findOne({
    type: 'dm',
    members: { $all: [userA, userB], $size: 2 },
  })
  if (!chat) {
    chat = await Chat.create({
      type: 'dm',
      members: [userA, userB],
      createdBy: userA,
    })
  }
  return chat
}

const getUserChats = async (userId) => {
  const chats = await Chat.find({ members: userId })
    .populate('members', 'name avatar email mobile isOnline')
    .populate({ path: 'lastMessage', select: 'content createdAt senderId status' })
    .sort({ updatedAt: -1 })

  return Promise.all(
    chats.map(async (chat) => {
      const other = chat.type === 'dm'
        ? chat.members.find((m) => m._id.toString() !== userId.toString())
        : null

      const unread = await Message.countDocuments({
        chatId: chat._id,
        senderId: { $ne: userId },
        status: { $ne: 'read' }
      })

      return {
        _id:         chat._id,
        type:        chat.type,
        name:        chat.type === 'group' ? chat.name : other?.name,
        avatar:      other?.avatar ?? null,
        isOnline:    other?.isOnline ?? false,
        members:     chat.members,
        lastMessage: chat.lastMessage,
        unread:      unread,
        updatedAt:   chat.updatedAt,
      }
    })
  )
}

const getChatMessages = async (chatId, userId) => {
  // Verify user is a member
  const chat = await Chat.findOne({ _id: chatId, members: userId })
  if (!chat) throw new Error('Not a member of this chat')

  // Mark all messages sent by the other user to 'read'
  await Message.updateMany(
    { chatId, senderId: { $ne: userId }, status: { $ne: 'read' } },
    { $set: { status: 'read' } }
  )

  return Message.find({ chatId, isDeleted: false })
    .populate('senderId', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(100)
}

const createMessage = async (chatId, senderId, content) => {
  const chat = await Chat.findOne({ _id: chatId, members: senderId })
  if (!chat) throw new Error('Not a member of this chat')

  let status = 'sent'
  const User = require('../models/User.model')
  const otherMembers = chat.members.filter(m => !m.equals(senderId))

  if (chat.type === 'dm' && otherMembers[0]) {
    const recipient = await User.findById(otherMembers[0])
    if (recipient && recipient.isOnline) {
      status = 'delivered'
    }
  }

  const message = await Message.create({ chatId, senderId, content, status })

  // Update lastMessage on chat
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt:   new Date(),
  })

  // Send push notification to other members
  if (otherMembers.length > 0) {
    const senderUser = await User.findById(senderId)
    const notificationService = require('./notification.service')

    for (const memberId of otherMembers) {
      try {
        const member = await User.findById(memberId)
        if (member && member.fcmToken) {
          notificationService.sendPush({
            userId: member._id,
            fcmToken: member.fcmToken,
            title: senderUser ? senderUser.name : 'LinkUp',
            body: content.startsWith('[Voice note') ? '🎤 Sent a voice note' : (content.startsWith('http') ? '📷 Photo' : content),
          }).catch(err => console.error('Chat push error:', err))
        }
      } catch (err) {
        console.error('Failed to notify member:', memberId, err)
      }
    }
  }

  return message.populate('senderId', 'name avatar')
}

module.exports = { getOrCreateDM, getUserChats, getChatMessages, createMessage }