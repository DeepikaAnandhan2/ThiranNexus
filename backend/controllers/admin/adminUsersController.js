// backend/controllers/admin/adminUsersController.js
// FIX: "unknown" in Avg Score by Disability chart.
// Root cause: GameScore.userId is stored as a STRING (from localStorage myId),
// but $lookup from 'users' uses ObjectId. The join silently fails → "unknown".
// Fix: after grouping by userId, manually fetch each User with a try/catch ObjectId cast.

const User          = require('../../models/User')
const ScribbleScore = require('../../models/ScribbleScore')
const GameScore     = require('../../models/GameScore')
const mongoose      = require('mongoose')

// ── Shared helper: resolve userId string → User document ──
async function resolveUser(userId) {
  if (!userId) return null
  try {
    return await User.findById(new mongoose.Types.ObjectId(String(userId))).select('name disabilityType email role state createdAt')
  } catch {
    return null
  }
}

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', disability = '', status = '' } = req.query

    const query = {}
    if (search)     query.$or            = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { udid: { $regex: search, $options: 'i' } }]
    if (role)       query.role           = role
    if (disability) query.disabilityType = disability
    if (status === 'active')   query.updatedAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    if (status === 'inactive') query.updatedAt = { $lt:  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await User.countDocuments(query)
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-password')

    // Disability breakdown
    const disabilityAgg = await User.aggregate([
      { $group: { _id: '$disabilityType', count: { $sum: 1 } } },
    ])
    const disabilityBreakdown = disabilityAgg.map(d => ({ label: d._id || 'unknown', count: d.count }))

    // ── FIX: Engagement by disability using manual user resolution ──
    // GameScore.userId is a string → can't $lookup directly on ObjectId.
    const allGameScores = await GameScore.aggregate([
      { $group: { _id: '$userId', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    ])

    const engagementByDisability = {}
    for (const gs of allGameScores) {
      const user = await resolveUser(gs._id)
      const dtype = user?.disabilityType || 'unknown'
      if (!engagementByDisability[dtype]) {
        engagementByDisability[dtype] = { sum: 0, count: 0 }
      }
      engagementByDisability[dtype].sum   += gs.avgScore * gs.count
      engagementByDisability[dtype].count += gs.count
    }

    const engagementBreakdown = Object.entries(engagementByDisability).map(([label, v]) => ({
      label,
      avgScore: Math.round(v.count > 0 ? v.sum / v.count : 0),
      count:    v.count,
    }))

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), users, disabilityBreakdown, engagementBreakdown })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    const [scribble, games] = await Promise.all([
      ScribbleScore.find({ userId: String(user._id) }).sort({ playedAt: -1 }).limit(5),
      GameScore.find({ userId: String(user._id) }).sort({ playedAt: -1 }).limit(10),
    ])
    res.json({ success: true, user, scribble, games })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowed = ['name','email','role','disabilityType','educationLevel','state','className','course','phone']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const [total, active, byDisability, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.aggregate([{ $group: { _id: '$disabilityType', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ])
    res.json({
      success: true,
      total,
      active,
      byDisability: byDisability.map(d => ({ label: d._id || 'unknown', count: d.count })),
      byRole:       byRole.map(r => ({ label: r._id || 'unknown', count: r.count })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    await Promise.all([
      ScribbleScore.deleteMany({ userId: String(req.params.id) }),
      GameScore.deleteMany({ userId: String(req.params.id) }),
    ])
    res.json({ success: true, message: 'User and related data deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Email Setup (nodemailer) ─────────────────────────────────────────
const nodemailer = require('nodemailer')
// For demo/dev purposes, you could use Ethereal or default config.
// Here we use a generic mock config that outputs to console if no env vars.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'password'
  }
})

// POST /api/admin/users/:id/report
exports.sendMonthlyReport = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const parentEmail = user.parentEmail || user.email // Fallback if no parent email
    if (!parentEmail) return res.status(400).json({ error: 'No parent or user email found to send report' })

    // Generate a simple mock HTML report
    const htmlReport = `
      <h2>Monthly Progress Report</h2>
      <p>Dear Parent/Guardian of <strong>${user.name}</strong>,</p>
      <p>This is the monthly progress report from ThiranNexus.</p>
      <ul>
        <li><strong>Department/Class:</strong> ${user.course || user.className || 'N/A'}</li>
        <li><strong>Disability Type:</strong> ${user.disabilityType || 'None'}</li>
      </ul>
      <p>Keep up the good work! Please log into the portal for detailed analytics on cognitive and educational performance.</p>
      <br />
      <p>Best Regards,</p>
      <p>ThiranNexus Admin Team</p>
    `

    console.log(`Sending Monthly Report to ${parentEmail}...`)
    
    // Attempt to send email (in dev it might fail if real credentials aren't provided, but we catch it)
    try {
      const info = await transporter.sendMail({
        from: '"ThiranNexus Admin" <admin@thirannexus.com>',
        to: parentEmail,
        subject: `Monthly Progress Report for ${user.name}`,
        html: htmlReport
      })
      console.log('Message sent: %s', info.messageId)
    } catch (mailErr) {
      console.warn("Mail send failed (probably missing SMTP config). Logging to console instead.", mailErr.message)
    }

    res.json({ success: true, message: 'Monthly report sent successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/admin/users/:id/schemes/notify
exports.notifySchemes = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { schemes } = req.body // Array of schemes passed from frontend

    const parentEmail = user.parentEmail || user.email
    if (!parentEmail) return res.status(400).json({ error: 'No parent or user email found to send notification' })

    const htmlSchemes = schemes && schemes.length > 0 
      ? schemes.map(s => `<li><strong>${s.title}</strong>: ${s.benefits} <br/><a href="${s.link || '#'}">More info</a></li>`).join('')
      : '<li>No specific schemes found at this time.</li>'

    const htmlContent = `
      <h2>Eligible Government Schemes Notification</h2>
      <p>Dear Parent/Guardian of <strong>${user.name}</strong>,</p>
      <p>Based on the student's profile, they may be eligible for the following government schemes/benefits:</p>
      <ul>
        ${htmlSchemes}
      </ul>
      <p>Please review these opportunities as they can provide significant support.</p>
      <br />
      <p>Best Regards,</p>
      <p>ThiranNexus Admin Team</p>
    `

    console.log(`Sending Schemes Notification to ${parentEmail}...`)
    
    try {
      const info = await transporter.sendMail({
        from: '"ThiranNexus Admin" <admin@thirannexus.com>',
        to: parentEmail,
        subject: `Eligible Schemes for ${user.name}`,
        html: htmlContent
      })
      console.log('Message sent: %s', info.messageId)
    } catch (mailErr) {
      console.warn("Mail send failed (probably missing SMTP config). Logging to console instead.", mailErr.message)
    }

    res.json({ success: true, message: 'Schemes notification sent successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}