const jwt  = require('jsonwebtoken')
const User = require('../models/User.model')

const protect = async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorised' })

  try {
    const token   = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user      = await User.findById(decoded.id).select('-passwordHash')
    if (!req.user) return res.status(401).json({ message: 'User not found' })
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = protect