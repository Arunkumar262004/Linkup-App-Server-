const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  type:      { type: String, enum: ['dm', 'group'], default: 'dm' },
  name:      { type: String },                          // only for group
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true })

module.exports = mongoose.model('Chat', chatSchema)