const mongoose = require('mongoose')

const GameScoreSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  gameType: { type: String, required: true, enum: ['twister', 'math', 'scribble'] },
  score:    { type: Number, default: 0 },
  streak:   { type: Number, default: 0 },
  playedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('GameScore', GameScoreSchema)
