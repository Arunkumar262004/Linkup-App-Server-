const jwt  = require('jsonwebtoken')
const User = require('../models/User.model')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const register = async ({ name, email, mobile, password }) => {
  const queryConditions = []
  if (email && email.trim()) queryConditions.push({ email: email.trim().toLowerCase() })
  if (mobile && mobile.trim()) queryConditions.push({ mobile: mobile.trim() })

  if (queryConditions.length === 0) {
    throw new Error('Email or mobile required')
  }

  const exists = await User.findOne({ $or: queryConditions })
  if (exists) throw new Error('User already exists')

  const user  = await User.create({
    name,
    email: email && email.trim() ? email.trim().toLowerCase() : undefined,
    mobile: mobile && mobile.trim() ? mobile.trim() : undefined,
    passwordHash: password
  })
  const token = signToken(user._id)
  return { token, user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile } }
}

const login = async ({ identifier, password }) => {
  const query = identifier.includes('@')
    ? { email: identifier.toLowerCase() }
    : { mobile: identifier }

  const user = await User.findOne(query)
  if (!user || !(await user.comparePassword(password)))
    throw new Error('Invalid credentials')

  const token = signToken(user._id)
  return { token, user: { _id: user._id, name: user.name, email: user.email, mobile: user.mobile } }
}

module.exports = { register, login }