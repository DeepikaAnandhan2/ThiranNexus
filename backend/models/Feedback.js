// backend/models/Feedback.js
const mongoose = require('mongoose')

const ReplySchema = new mongoose.Schema({
  from:    { type: String, enum: ['user', 'admin'], default: 'admin' },
  message: { type: String, required: true },
  sentAt:  { type: Date, default: Date.now },
})

const FeedbackSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  subject:  { type: String, required: true },
  message:  { type: String, required: true },
  category: { type: String, enum: ['Bug', 'Feature', 'Audio', 'Feedback', 'Other'], default: 'Other' },
  status:   { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  replies:  [ReplySchema],
  resolvedAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('Feedback', FeedbackSchema)