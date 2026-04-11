// backend/controllers/admin/adminAlertsController.js
// FIX (Image 3): "Resolve" now actually NOTIFIES the student.
// When an admin clicks Resolve, the system:
//   1. Creates an in-app notification record in a Notification collection
//   2. Optionally sends an email via nodemailer (if SMTP is configured)
//   3. Marks the alert as Resolved
// Students see their notifications on next login or via /api/notifications/mine.

const Alert         = require('../../models/Alert')
const User          = require('../../models/User')
const GameScore     = require('../../models/GameScore')
const ScribbleScore = require('../../models/ScribbleScore')
const mongoose      = require('mongoose')

// ── Resolve helper ────────────────────────────────────────
// Try to load nodemailer — works if SMTP env vars are set, gracefully skips if not.
async function sendEmailNotification(toEmail, userName, alertText) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Alert] Email skipped — SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env')
    return false
  }
  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({
      from:    `"ThiranNexus Admin" <${process.env.SMTP_USER}>`,
      to:      toEmail,
      subject: '📢 ThiranNexus — Action Required',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#7c3aed;">Hi ${userName},</h2>
          <p style="color:#333;">Our team noticed the following and wanted to reach out:</p>
          <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:16px;border-radius:8px;margin:16px 0;">
            <strong>${alertText}</strong>
          </div>
          <p style="color:#333;">
            We encourage you to log back in and continue your learning journey. 
            Every session helps you grow! 💪
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
             style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:8px;">
            Return to ThiranNexus
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:24px;">ThiranNexus · Inclusive Education Platform</p>
        </div>
      `,
    })
    return true
  } catch (err) {
    console.error('[Alert] Email send failed:', err.message)
    return false
  }
}

// ── Create in-app notification ────────────────────────────
// Stored in the Notification collection so student sees it on dashboard.
async function createInAppNotification(userId, title, message) {
  try {
    // Dynamically require to avoid crash if model doesn't exist yet
    const Notification = require('../../models/Notification')
    await Notification.create({ userId: String(userId), title, message, read: false })
  } catch (err) {
    console.warn('[Alert] In-app notification skipped:', err.message)
  }
}

// ── Auto-generate alerts ──────────────────────────────────
async function autoGenerateAlerts() {
  const cutoff3 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  const recentPlayerIds = new Set([
    ...(await GameScore.distinct('userId',     { playedAt: { $gte: cutoff3 } })).map(String),
    ...(await ScribbleScore.distinct('userId', { playedAt: { $gte: cutoff3 } })).map(String),
  ])

  const allStudents = await User.find({ createdAt: { $lt: cutoff3 }, role: 'student' }).select('_id name')

  for (const user of allStudents) {
    if (!recentPlayerIds.has(String(user._id))) {
      const exists = await Alert.findOne({ userId: user._id, alert: 'Inactive for 3 days', status: 'Active' })
      if (!exists) {
        await Alert.create({ userId: user._id, userName: user.name, alert: 'Inactive for 3 days', type: 'Warning', severity: 'warning' })
      }
    }
  }

  // Low math performance
  const lowPerf = await GameScore.aggregate([
    { $match: { gameType: 'math' } },
    { $group: { _id: '$userId', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    { $match: { avgScore: { $lt: 2 }, count: { $gte: 3 } } },
  ])
  for (const lp of lowPerf) {
    let user = null
    try { user = await User.findById(new mongoose.Types.ObjectId(String(lp._id))).select('name') } catch {}
    if (!user) continue
    const exists = await Alert.findOne({ userId: lp._id, alert: 'Low Performance (Math)', status: 'Active' })
    if (!exists) {
      await Alert.create({ userId: lp._id, userName: user.name, alert: 'Low Performance (Math)', type: 'Info', severity: 'info' })
    }
  }
}

// GET /api/admin/alerts
exports.getAlerts = async (req, res) => {
  try {
    await autoGenerateAlerts()
    const { status = '', severity = '', page = 1, limit = 50 } = req.query
    const query = {}
    if (status)   query.status   = status
    if (severity) query.severity = severity

    const total  = await Alert.countDocuments(query)
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('userId', 'name email disabilityType')

    const [critical, warning, info, resolved] = await Promise.all([
      Alert.countDocuments({ severity: 'critical', status: 'Active' }),
      Alert.countDocuments({ severity: 'warning',  status: 'Active' }),
      Alert.countDocuments({ severity: 'info',     status: 'Active' }),
      Alert.countDocuments({ status: 'Resolved' }),
    ])

    res.json({ success: true, total, counts: { critical, warning, info, resolved }, alerts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/alerts/:id/resolve
// ── THE KEY FIX: actually notify the student ──────────────
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('userId', 'name email')
    if (!alert) return res.status(404).json({ error: 'Alert not found' })

    // Determine student info
    const studentUser  = alert.userId   // populated User doc (if stored as ObjectId)
    const studentName  = studentUser?.name  || alert.userName || 'Student'
    const studentEmail = studentUser?.email || null

    // Build message based on alert type
    const messageMap = {
      'Inactive for 3 days':      'We noticed you haven\'t logged in for a while. Come back and continue your learning journey! 🎯',
      'Low Performance (Math)':   'Your math scores could use some practice. Try a few Mental Math rounds to improve! 🧮',
      'Unusual Activity Detected':'If you experienced any issues, please let us know via the Feedback section. 💬',
      'Missed Sessions':          'You\'ve missed some sessions. Regular practice helps you improve faster! 📚',
    }
    const notifMessage = messageMap[alert.alert] || 'The admin team has reviewed your account and wants to support your progress.'

    // 1. Create in-app notification (visible on student dashboard)
    if (studentUser?._id) {
      await createInAppNotification(
        studentUser._id,
        '📢 Message from ThiranNexus Admin',
        notifMessage
      )
    }

    // 2. Send email notification (if SMTP configured)
    let emailSent = false
    if (studentEmail) {
      emailSent = await sendEmailNotification(studentEmail, studentName, alert.alert + ' — ' + notifMessage)
    }

    // 3. Mark alert as resolved
    const resolved = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'Resolved', resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    )

    res.json({
      success: true,
      alert: resolved,
      notification: {
        inApp:     !!studentUser?._id,
        email:     emailSent,
        emailTo:   studentEmail || 'not available',
        message:   notifMessage,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/admin/alerts (manual)
exports.createAlert = async (req, res) => {
  try {
    const { userId, alert: alertText, type, severity } = req.body
    let user = null
    try { user = await User.findById(new mongoose.Types.ObjectId(String(userId))).select('name') } catch {}
    if (!user) return res.status(404).json({ error: 'User not found' })
    const alert = await Alert.create({ userId, userName: user.name, alert: alertText, type: type || 'Info', severity: severity || 'info' })
    res.status(201).json({ success: true, alert })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/admin/alerts/:id
exports.deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Alert deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}