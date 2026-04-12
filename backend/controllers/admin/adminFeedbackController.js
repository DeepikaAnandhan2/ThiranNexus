// backend/controllers/admin/adminFeedbackController.js
// FIX (Image 4): The feedback cycle was unclear.
// 
// HOW IT WORKS NOW:
//   STUDENT SIDE:
//     POST /api/feedback/submit  (uses regular 'protect' middleware, not adminProtect)
//     → Student submits subject + message from their portal
//     → Creates a Feedback document with status:'Open'
//
//   ADMIN SIDE:
//     GET  /api/admin/feedback         → Admin sees all tickets
//     POST /api/admin/feedback/:id/reply → Admin types a reply → saved in ticket.replies[]
//                                         → In-app notification sent to student
//     PUT  /api/admin/feedback/:id/status → Admin changes status (Open/In Progress/Resolved)
//
//   STUDENT SIDE (reading replies):
//     GET /api/feedback/my-tickets     → Student sees their tickets + admin replies

const Feedback     = require('../../models/Feedback')
const mongoose     = require('mongoose')

// ── Notify student of admin reply ────────────────────────
async function notifyStudentOfReply(userId, subject, replyText) {
  try {
    const Notification = require('../../models/Notification')
    await Notification.create({
      userId:  String(userId),
      title:   `💬 Admin replied to: "${subject}"`,
      message: replyText,
      read:    false,
    })
  } catch (err) {
    console.warn('[Feedback] In-app notification skipped:', err.message)
  }
}

// GET /api/admin/feedback — admin sees all tickets
exports.getAllFeedback = async (req, res) => {
  try {
    const { status = '', category = '', page = 1, limit = 20 } = req.query
    const query = {}
    if (status)   query.status   = status
    if (category) query.category = category

    const total = await Feedback.countDocuments(query)
    const items = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('userId', 'name email disabilityType')

    const [open, inProgress, resolved] = await Promise.all([
      Feedback.countDocuments({ status: 'Open' }),
      Feedback.countDocuments({ status: 'In Progress' }),
      Feedback.countDocuments({ status: 'Resolved' }),
    ])

    const total2 = await Feedback.countDocuments()
    const satisfactionPct = total2 > 0
      ? ((resolved / total2) * 5).toFixed(1)
      : '0.0'

    res.json({ success: true, total, counts: { open, inProgress, resolved }, satisfaction: satisfactionPct, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/feedback/:id — admin gets one ticket with full thread
exports.getFeedbackById = async (req, res) => {
  try {
    const item = await Feedback.findById(req.params.id).populate('userId', 'name email')
    if (!item) return res.status(404).json({ error: 'Feedback not found' })
    res.json({ success: true, item })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/admin/feedback/:id/reply — admin replies to a ticket
exports.replyToFeedback = async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'Reply message required' })

    const item = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { from: 'admin', message } }, status: 'In Progress' },
      { new: true }
    ).populate('userId', 'name email _id')

    if (!item) return res.status(404).json({ error: 'Feedback not found' })

    // Notify student in-app
    if (item.userId?._id) {
      await notifyStudentOfReply(item.userId._id, item.subject, message)
    }

    res.json({ success: true, item })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/feedback/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['Open','In Progress','Resolved'].includes(status))
      return res.status(400).json({ error: 'Invalid status' })

    const updates = { status }
    if (status === 'Resolved') updates.resolvedAt = new Date()

    const item = await Feedback.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!item) return res.status(404).json({ error: 'Feedback not found' })
    res.json({ success: true, item })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/feedback/submit — STUDENT submits a ticket (uses regular protect middleware)
// ⚠️  Register this in a SEPARATE student-facing route file, not adminRoutes.
//     See: backend/routes/feedbackRoutes.js
exports.submitFeedback = async (req, res) => {
  try {
    const { subject, message, category } = req.body
    if (!subject || !message)
      return res.status(400).json({ error: 'Subject and message are required' })

    const item = await Feedback.create({
      userId:   req.user._id,
      userName: req.user.name,
      subject,
      message,
      category: category || 'Other',
    })
    res.status(201).json({ success: true, item })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/feedback/my-tickets — STUDENT reads their own tickets + admin replies
exports.getMyTickets = async (req, res) => {
  try {
    const userId = String(req.user._id)
    const tickets = await Feedback.find({
      $or: [{ userId: req.user._id }, { userId: userId }],
    }).sort({ createdAt: -1 })
    res.json({ success: true, tickets })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}