const cron     = require('node-cron')
const Reminder = require('../models/Reminder.model')
const User     = require('../models/User.model')
const notifSvc = require('../services/notification.service')

// Runs every minute
cron.schedule('* * * * *', async () => {
  const now = new Date()

  const due = await Reminder.find({
    status:   'pending',
    remindAt: { $lte: now },
  }).populate('userId', 'fcmToken name')

  for (const reminder of due) {
    const user = reminder.userId            // populated

    await notifSvc.sendPush({
      userId:     user._id,
      fcmToken:   user.fcmToken,
      title:      reminder.title,
      body:       reminder.description || 'You have a reminder!',
      reminderId: reminder._id,
    })

    if (reminder.isRecurring && reminder.cronExpr) {
      // For recurring: keep status pending, update remindAt to next occurrence
      // Use cron-parser to calculate next date
      const parser = require('cron-parser')
      const interval = parser.parseExpression(reminder.cronExpr)
      await Reminder.findByIdAndUpdate(reminder._id, {
        remindAt: interval.next().toDate()
      })
    } else {
      await Reminder.findByIdAndUpdate(reminder._id, { status: 'sent' })
    }
  }
})

console.log('Reminder cron job started')