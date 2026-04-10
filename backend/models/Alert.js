// backend/models/Alert.js
const mongoose = require('mongoose')

const AlertSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  alert:    { type: String, required: true },
  type:     { type: String, enum: ['Critical', 'Warning', 'Info'], default: 'Info' },
  severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
  status:   { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  resolvedAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('Alert', AlertSchema)