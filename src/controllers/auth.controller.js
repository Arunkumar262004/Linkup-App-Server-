const authService = require('../services/auth.service')

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { register, login }