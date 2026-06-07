const mongoose = require('mongoose')

const notifLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reminder' },
  channel:    { type: String, enum: ['push', 'sms', 'email'], default: 'push' },
  status:     { type: String, enum: ['sent', 'failed'], default: 'sent' },
}, { timestamps: true })

module.exports = mongoose.model('NotifLog', notifLogSchema)