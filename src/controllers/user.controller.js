const userSvc = require('../services/user.service')

const search = async (req, res) => {
  const { q } = req.query
  if (!q || q.trim().length < 3)
    return res.status(400).json({ message: 'Query must be at least 3 characters' })

  const user = await userSvc.searchUser(q, req.user._id)
  if (!user) return res.status(404).json({ message: 'No user found' })
  res.json({ user })
}

const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken required' })
    await userSvc.updateFCMToken(req.user._id, fcmToken)
    res.json({ message: 'FCM token updated' })
  } catch (e) { res.status(500).json({ message: e.message }) }
}

const getMe = (req, res) => res.json(req.user)

const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body
    const user = await userSvc.updateProfile(req.user._id, { name, bio })
    res.json(user)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    const user = await userSvc.updateAvatar(req.user._id, avatarUrl)
    res.json({ avatar: avatarUrl, user })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
}

module.exports = { search, updateFCMToken, getMe, updateProfile, updateAvatar }