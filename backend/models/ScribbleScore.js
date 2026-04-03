const mongoose = require('mongoose')

// Tracks individual user scribble game history
const ScribbleScoreSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  nickname:    { type: String, required: true },
  roomCode:    { type: String, required: true },
  totalScore:  { type: Number, default: 0 },
  rank:        { type: Number, default: 0 },
  wordsDrawn:  { type: Number, default: 0 },
  correctGuesses:{ type: Number, default: 0 },
  playedAt:    { type: Date, default: Date.now },
})

module.exports = mongoose.model('ScribbleScore', ScribbleScoreSchema)