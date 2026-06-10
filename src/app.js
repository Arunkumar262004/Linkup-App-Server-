const express = require('express')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')

const app = express()
app.use(cors())
app.use(express.json())

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use('/uploads', express.static(uploadsDir))

app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/users',     require('./routes/user.routes'))
app.use('/api/chats',     require('./routes/chat.routes'))
app.use('/api/reminders', require('./routes/reminder.routes'))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Server error' })
})

module.exports = app