const chatSvc = require('../services/chat.service')

const createOrGetChat = async (req, res) => {
  try {
    const { recipientId } = req.body
    if (!recipientId) return res.status(400).json({ message: 'recipientId required' })
    const chat = await chatSvc.getOrCreateDM(req.user._id, recipientId)
    res.status(200).json(chat)
  } catch (e) { res.status(400).json({ message: e.message }) }
}

const getMyChats = async (req, res) => {
  try {
    const chats = await chatSvc.getUserChats(req.user._id)
    res.json(chats)
  } catch (e) { res.status(500).json({ message: e.message }) }
}

const getMessages = async (req, res) => {
  try {
    const messages = await chatSvc.getChatMessages(req.params.id, req.user._id)
    res.json(messages)
  } catch (e) { res.status(403).json({ message: e.message }) }
}

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ message: 'content required' })
    const message = await chatSvc.createMessage(req.params.id, req.user._id, content.trim())
    res.status(201).json(message)
  } catch (e) { res.status(400).json({ message: e.message }) }
}

module.exports = { createOrGetChat, getMyChats, getMessages, sendMessage }