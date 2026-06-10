const router  = require('express').Router()
const ctrl    = require('../controllers/user.controller')
const protect = require('../middleware/auth.middleware')
const multer  = require('multer')
const path    = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

router.use(protect)
router.get('/me',           ctrl.getMe)             // GET  /api/users/me
router.get('/search',       ctrl.search)            // GET  /api/users/search?q=...
router.patch('/fcm-token',  ctrl.updateFCMToken)    // PATCH /api/users/fcm-token
router.patch('/profile',    ctrl.updateProfile)     // PATCH /api/users/profile
router.post('/avatar',      upload.single('avatar'), ctrl.updateAvatar) // POST /api/users/avatar

module.exports = router