// backend/controllers/admin/adminFeedbackController.js
const Feedback = require('../../models/Feedback')

exports.getAllFeedback = async (req, res) => {
  try {
    const { status='', category='', page=1, limit=20 } = req.query
    const query = {}
    if (status)   query.status   = status
    if (category) query.category = category
    const total = await Feedback.countDocuments(query)
    const items = await Feedback.find(query).sort({ createdAt: -1 }).skip((parseInt(page)-1)*parseInt(limit)).limit(parseInt(limit)).populate('userId','name email')
    const [open, inProgress, resolved] = await Promise.all([
      Feedback.countDocuments({ status: 'Open' }),
      Feedback.countDocuments({ status: 'In Progress' }),
      Feedback.countDocuments({ status: 'Resolved' }),
    ])
    const total2 = await Feedback.countDocuments()
    const satisfaction = total2 > 0 ? ((resolved / total2) * 5).toFixed(1) : '0.0'
    res.json({ success: true, total, counts: { open, inProgress, resolved }, satisfaction, items })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.getFeedbackById = async (req, res) => {
  try {
    const item = await Feedback.findById(req.params.id).populate('userId','name email')
    if (!item) return res.status(404).json({ success: false, error: 'Feedback not found' })
    res.json({ success: true, item })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.submitFeedback = async (req, res) => {
  try {
    const { subject, message, category, userName } = req.body
    if (!subject || !message) return res.status(400).json({ success: false, error: 'subject and message required' })
    const item = await Feedback.create({ subject, message, category: category||'Other', userName: userName||'Anonymous' })
    res.status(201).json({ success: true, item })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.replyToFeedback = async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ success: false, error: 'message required' })
    const item = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { from: 'admin', message } }, status: 'In Progress' },
      { new: true }
    ).populate('userId','name email')
    if (!item) return res.status(404).json({ success: false, error: 'Feedback not found' })
    res.json({ success: true, item })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const updates = { status }
    if (status === 'Resolved') updates.resolvedAt = new Date()
    const item = await Feedback.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!item) return res.status(404).json({ success: false, error: 'Feedback not found' })
    res.json({ success: true, item })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}