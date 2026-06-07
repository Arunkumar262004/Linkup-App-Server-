require('dotenv').config()
const http         = require('http')
const app          = require('./app')
const connectDB    = require('./config/db')
const { initSocket } = require('./config/socket')

require('./jobs/reminder.job')          // start cron
// console.log(process.env.FIREBASE_PRIVATE_KEY);
connectDB().then(() => {
  const server = http.createServer(app)
  initSocket(server)
  server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  )
})