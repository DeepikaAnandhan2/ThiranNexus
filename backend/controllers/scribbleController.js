const ScribbleRoom  = require('../models/ScribbleRoom')
const ScribbleScore = require('../models/ScribbleScore')

// ── Word bank ──────────────────────────────────────────────
const WORD_BANK = {
  general: [
    'apple','banana','house','tree','car','sun','moon','star','fish','bird',
    'flower','mountain','river','ocean','bridge','clock','chair','table',
    'phone','book','pencil','glasses','umbrella','rainbow','butterfly',
    'elephant','giraffe','penguin','dolphin','dragon','castle','guitar',
    'pizza','rocket','robot','crown','diamond','cloud','tornado','volcano',
  ],
  animals: [
    'cat','dog','lion','tiger','bear','rabbit','horse','cow','pig','sheep',
    'monkey','zebra','crocodile','kangaroo','parrot','turtle','snake','owl',
  ],
  food: [
    'pizza','burger','cake','ice cream','sandwich','spaghetti','sushi','taco',
    'donut','cookie','waffle','popcorn','mango','strawberry','watermelon',
  ],
  objects: [
    'toothbrush','lamp','mirror','keyboard','headphones','camera','bicycle',
    'kite','compass','magnifier','trophy','crown','anchor','hammer','key',
  ],
}

// ── Get random word ────────────────────────────────────────
const getRandomWords = (category = 'general', count = 3) => {
  const pool = WORD_BANK[category] || WORD_BANK.general
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ── Generate room code ─────────────────────────────────────
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─────────────────────────────────────────────────────────
// POST /api/scribble/room/create
// ─────────────────────────────────────────────────────────
const createRoom = async (req, res) => {
  try {
    const { userId, nickname, avatar = '😊', totalRounds = 3, timePerRound = 80, wordCategory = 'general' } = req.body
    if (!userId || !nickname) return res.status(400).json({ error: 'userId and nickname required' })

    let roomCode, exists
    do {
      roomCode = generateRoomCode()
      exists   = await ScribbleRoom.findOne({ roomCode })
    } while (exists)

    const room = await ScribbleRoom.create({
      roomCode, hostId: userId, hostName: nickname,
      totalRounds, timePerRound, wordCategory,
      players: [{ userId, nickname, avatar, isDrawing: false }],
    })

    res.status(201).json({ success: true, roomCode, room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/scribble/room/join
// ─────────────────────────────────────────────────────────
const joinRoom = async (req, res) => {
  try {
    const { roomCode, userId, nickname, avatar = '😊' } = req.body
    const room = await ScribbleRoom.findOne({ roomCode: roomCode.toUpperCase() })
    if (!room) return res.status(404).json({ error: 'Room not found' })
    if (room.status === 'finished') return res.status(400).json({ error: 'Game already finished' })
    if (room.players.length >= room.maxPlayers) return res.status(400).json({ error: 'Room is full' })

    const alreadyIn = room.players.find(p => p.userId === userId)
    if (!alreadyIn) {
      room.players.push({ userId, nickname, avatar })
      await room.save()
    }

    res.json({ success: true, room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/scribble/room/:roomCode
// ─────────────────────────────────────────────────────────
const getRoom = async (req, res) => {
  try {
    const room = await ScribbleRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() })
    if (!room) return res.status(404).json({ error: 'Room not found' })
    res.json({ success: true, room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/scribble/words?category=general
// ─────────────────────────────────────────────────────────
const getWords = (req, res) => {
  const { category = 'general', count = 3 } = req.query
  const words = getRandomWords(category, parseInt(count))
  res.json({ success: true, words })
}

// ─────────────────────────────────────────────────────────
// POST /api/scribble/score/save
// Save final game scores to MongoDB
// ─────────────────────────────────────────────────────────
const saveScore = async (req, res) => {
  try {
    const { roomCode, scores } = req.body
    // scores = [{ userId, nickname, totalScore, rank, wordsDrawn, correctGuesses }]
    if (!roomCode || !scores?.length) return res.status(400).json({ error: 'Missing data' })

    // Save each player score
    await Promise.all(scores.map(s =>
      ScribbleScore.create({ roomCode, ...s })
    ))

    // Update room finalScores
    await ScribbleRoom.findOneAndUpdate(
      { roomCode },
      { finalScores: scores, status: 'finished', endedAt: new Date() }
    )

    res.json({ success: true, message: 'Scores saved' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/scribble/leaderboard/:userId
// Get user's scribble game history
// ─────────────────────────────────────────────────────────
const getUserHistory = async (req, res) => {
  try {
    const history = await ScribbleScore
      .find({ userId: req.params.userId })
      .sort({ playedAt: -1 })
      .limit(10)
    res.json({ success: true, history })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { createRoom, joinRoom, getRoom, getWords, saveScore, getUserHistory, getRandomWords }