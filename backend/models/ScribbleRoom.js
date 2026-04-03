const mongoose = require('mongoose')

const PlayerSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  nickname:  { type: String, required: true },
  avatar:    { type: String, default: '😊' },
  score:     { type: Number, default: 0 },
  hasGuessed:{ type: Boolean, default: false },
  isDrawing: { type: Boolean, default: false },
  socketId:  { type: String, default: '' },
})

const RoundSchema = new mongoose.Schema({
  roundNumber:  { type: Number, required: true },
  word:         { type: String, required: true },
  drawerId:     { type: String, required: true },
  drawerName:   { type: String, required: true },
  drawingData:  { type: String, default: '' },   // base64 final canvas snapshot
  correctGuesses: [{ userId: String, nickname: String, timeTaken: Number, pointsEarned: Number }],
  startedAt:    { type: Date, default: Date.now },
  endedAt:      { type: Date },
})

const ScribbleRoomSchema = new mongoose.Schema({
  roomCode:    { type: String, required: true, unique: true },
  hostId:      { type: String, required: true },
  hostName:    { type: String, required: true },
  status:      { type: String, enum: ['waiting','playing','finished'], default: 'waiting' },
  players:     [PlayerSchema],
  rounds:      [RoundSchema],
  currentRound:{ type: Number, default: 0 },
  totalRounds: { type: Number, default: 3 },
  timePerRound:{ type: Number, default: 80 },   // seconds
  maxPlayers:  { type: Number, default: 8 },
  wordCategory:{ type: String, default: 'general' },
  // Leaderboard snapshot at end
  finalScores: [{
    userId: String, nickname: String, score: Number, rank: Number
  }],
  createdAt:   { type: Date, default: Date.now },
  endedAt:     { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('ScribbleRoom', ScribbleRoomSchema)