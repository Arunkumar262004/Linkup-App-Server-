const express = require('express')
const cors    = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

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