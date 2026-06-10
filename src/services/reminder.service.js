const Reminder = require('../models/Reminder.model')
const User = require('../models/User.model')
const notifSvc = require('./notification.service')

const create = async (userId, body) => {
  const reminder = await Reminder.create({ userId, ...body })
  try {
    const user = await User.findById(userId)
    if (user && user.fcmToken) {
      await notifSvc.sendPush({
        userId,
        fcmToken: user.fcmToken,
        title: `Reminder Scheduled: ${reminder.title}`,
        body: reminder.description || 'Your reminder is active!',
        reminderId: reminder._id,
      })
    }
  } catch (e) {
    console.error('FCM Immediate error:', e.message)
  }
  return reminder
}

const getAll = (userId) =>
  Reminder.find({ userId }).sort({ remindAt: 1 })

const getOne = (userId, id) =>
  Reminder.findOne({ _id: id, userId })

const update = (userId, id, body) =>
  Reminder.findOneAndUpdate({ _id: id, userId }, body, { new: true })

const remove = (userId, id) =>
  Reminder.findOneAndDelete({ _id: id, userId })

module.exports = { create, getAll, getOne, update, remove }