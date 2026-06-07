const router  = require('express').Router()
const ctrl    = require('../controllers/chat.controller')
const protect = require('../middleware/auth.middleware')

router.use(protect)
router.post('/',                    ctrl.createOrGetChat)   // POST /api/chats
router.get('/',                     ctrl.getMyChats)        // GET  /api/chats
router.get('/:id/messages',         ctrl.getMessages)       // GET  /api/chats/:id/messages
router.post('/:id/messages',        ctrl.sendMessage)       // POST /api/chats/:id/messages

module.exports = router