// backend/routes/dashboard.js

const express = require('express')
const router  = express.Router()
const { getSummary, getGames, getEducation, getSchemes, getLeaderboard, saveGameScore } = require('../controllers/dashboardController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.get('/summary',     getSummary)       // GET /api/dashboard/summary
router.get('/games',       getGames)         // GET /api/dashboard/games?limit=10
router.get('/education',   getEducation)     // GET /api/dashboard/education
router.get('/schemes',     getSchemes)       // GET /api/dashboard/schemes
router.get('/leaderboard', getLeaderboard)   // GET /api/dashboard/leaderboard
router.post('/game/score', saveGameScore)    // POST /api/dashboard/game/score

module.exports = router