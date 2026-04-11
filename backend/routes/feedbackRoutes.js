// backend/routes/feedbackRoutes.js
// Student-facing feedback endpoints (NOT admin-protected).
// Add to server.js: app.use('/api/feedback', require('./routes/feedbackRoutes'))

const express  = require('express')
const router   = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { submitFeedback, getMyTickets } = require('../controllers/admin/adminFeedbackController')

router.use(protect)   // must be logged in as student/parent

// POST /api/feedback/submit — student submits a new ticket
router.post('/submit', submitFeedback)

// GET /api/feedback/my-tickets — student reads their tickets + admin replies
router.get('/my-tickets', getMyTickets)

module.exports = router