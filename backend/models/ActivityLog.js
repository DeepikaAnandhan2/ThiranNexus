const mongoose = require('mongoose')

// Tracks every student activity — study, games, login
const ActivityLogSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  type:         {
    type: String,
    enum: ['login','study','game_twister','game_math','game_scribble','scheme_viewed'],
    required: true
  },
  // For studya
  subject:      { type: String, default: '' },
  chapter:      { type: String, default: '' },
  durationMins: { type: Number, default: 0 },

  // For games
  gameName:     { type: String, default: '' },
  score:        { type: Number, default: 0 },
  streak:       { type: Number, default: 0 },
  accuracy:     { type: Number, default: 0 },  // 0-100 %
  difficulty:   { type: String, default: 'easy' },
  roundsPlayed: { type: Number, default: 0 },

  // Timestamp
  date:         { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('ActivityLog', ActivityLogSchema)