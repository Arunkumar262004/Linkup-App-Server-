const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  remindAt:    { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  cronExpr:    { type: String, default: null },          // e.g. "0 9 * * 1"
  status:      { type: String, enum: ['pending', 'sent', 'dismissed'], default: 'pending' },
}, { timestamps: true })

reminderSchema.index({ userId: 1, status: 1, remindAt: 1 })

module.exports = mongoose.model('Reminder', reminderSchema)