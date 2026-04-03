const express = require('express')
const router  = express.Router()
const {
  createRoom, joinRoom, getRoom,
  getWords, saveScore, getUserHistory,
} = require('../controllers/scribbleController')

router.post('/room/create',       createRoom)
router.post('/room/join',         joinRoom)
router.get('/room/:roomCode',     getRoom)
router.get('/words',              getWords)
router.post('/score/save',        saveScore)
router.get('/leaderboard/:userId',getUserHistory)

module.exports = router