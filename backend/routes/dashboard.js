// backend/routes/dashboard.js

const express = require('express')
const router  = express.Router()
const { getSummary, getGames, getEducation } = require('../controllers/dashboardController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.get('/summary',   getSummary)    // GET /api/dashboard/summary
router.get('/games',     getGames)      // GET /api/dashboard/games?limit=10
router.get('/education', getEducation)  // GET /api/dashboard/education

module.exports = router