// backend/routes/notificationRoutes.js
// Student-facing notification endpoints.
// Add to server.js: app.use('/api/notifications', require('./routes/notificationRoutes'))

const express      = require('express')
const router       = express.Router()
const Notification = require('../models/Notification')
const { protect }  = require('../middleware/authMiddleware')

router.use(protect)

// GET /api/notifications/mine — get all notifications for logged-in student
router.get('/mine', async (req, res) => {
  try {
    const userId = String(req.user._id)
    const notifs = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)

    const unreadCount = await Notification.countDocuments({ userId, read: false })

    res.json({ success: true, notifications: notifs, unreadCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/notifications/:id/read — mark one notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true, readAt: new Date() })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = String(req.user._id)
    await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router