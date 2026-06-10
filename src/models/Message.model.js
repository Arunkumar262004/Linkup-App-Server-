const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chatId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  type:      { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  isDeleted: { type: Boolean, default: false },
  status:    { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)