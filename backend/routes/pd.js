const express = require('express')
const router  = express.Router()
const { getChildDashboard, logActivity, getParentChildren } = require('../controllers/pdc')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.get('/child/:userId',       getChildDashboard)
router.get('/parent/:parentId',    getParentChildren)
router.post('/log',                logActivity)

module.exports = router
// Add to server.js: app.use('/api/dashboard', require('./routes/dashboard'))