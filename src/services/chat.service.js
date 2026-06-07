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
    .populate({ path: 'lastMessage', select: 'content createdAt senderId' })
    .sort({ updatedAt: -1 })

  // Shape each chat for the client — give it a display name from the other member
  return chats.map((chat) => {
    const other = chat.type === 'dm'
      ? chat.members.find((m) => m._id.toString() !== userId.toString())
      : null
    return {
      _id:         chat._id,
      type:        chat.type,
      name:        chat.type === 'group' ? chat.name : other?.name,
      avatar:      other?.avatar ?? null,
      isOnline:    other?.isOnline ?? false,
      members:     chat.members,
      lastMessage: chat.lastMessage,
      updatedAt:   chat.updatedAt,
    }
  })
}

const getChatMessages = async (chatId, userId) => {
  // Verify user is a member
  const chat = await Chat.findOne({ _id: chatId, members: userId })
  if (!chat) throw new Error('Not a member of this chat')

  return Message.find({ chatId, isDeleted: false })
    .populate('senderId', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(100)
}

const createMessage = async (chatId, senderId, content) => {
  const chat = await Chat.findOne({ _id: chatId, members: senderId })
  if (!chat) throw new Error('Not a member of this chat')

  const message = await Message.create({ chatId, senderId, content })

  // Update lastMessage on chat
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt:   new Date(),
  })

  return message.populate('senderId', 'name avatar')
}

module.exports = { getOrCreateDM, getUserChats, getChatMessages, createMessage }