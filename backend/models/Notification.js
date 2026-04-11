// backend/models/Notification.js
// Stores in-app notifications for students.
// Created when admin resolves an alert.
// Students read these via GET /api/notifications/mine

const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  userId:  { type: String, required: true },   // string to match GameScore.userId pattern
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  readAt:  { type: Date },
}, { timestamps: true })

// Index for fast per-user lookup
NotificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', NotificationSchema)