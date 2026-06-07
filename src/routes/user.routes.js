const router  = require('express').Router()
const ctrl    = require('../controllers/user.controller')
const protect = require('../middleware/auth.middleware')

router.use(protect)
router.get('/me',           ctrl.getMe)             // GET  /api/users/me
router.get('/search',       ctrl.search)            // GET  /api/users/search?q=...
router.patch('/fcm-token',  ctrl.updateFCMToken)    // PATCH /api/users/fcm-token

module.exports = router