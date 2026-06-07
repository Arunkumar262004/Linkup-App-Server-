const admin    = require('../config/firebase')
const NotifLog = require('../models/NotifLog.model')

const sendPush = async ({ userId, fcmToken, title, body, reminderId }) => {
  if (!fcmToken) return

  const message = {
    token: fcmToken,
    notification: { title, body },
    data: { reminderId: reminderId.toString() },
  }

  try {
    await admin.messaging().send(message)
    await NotifLog.create({ userId, reminderId, channel: 'push', status: 'sent' })
  } catch (err) {
    await NotifLog.create({ userId, reminderId, channel: 'push', status: 'failed' })
    console.error('FCM error:', err.message)
  }
}

module.exports = { sendPush }