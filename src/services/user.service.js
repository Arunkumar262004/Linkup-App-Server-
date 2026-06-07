const User = require('../models/User.model')

const searchUser = async (query, requestingUserId) => {
  const q = query.trim().toLowerCase()
  const user = await User.findOne({
    $or: [{ email: q }, { mobile: q }],
  }).select('_id name avatar email mobile')

  if (!user || user._id.equals(requestingUserId)) return null
  return user
}

const updateFCMToken = (userId, fcmToken) =>
  User.findByIdAndUpdate(userId, { fcmToken }, { new: true })

const updateOnlineStatus = (userId, isOnline) =>
  User.findByIdAndUpdate(userId, { isOnline })

module.exports = { searchUser, updateFCMToken, updateOnlineStatus }