const express = require('express')
const router  = express.Router()
const { registerUser, loginUser, verifyUDID, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// Public
router.post('/register',           registerUser)
router.post('/login',              loginUser)
router.get('/verify-udid/:udid',   verifyUDID)

// Protected
router.get('/me', protect, getMe)

module.exports = router 