// backend/controllers/parentController.js
const User          = require('../models/User')
const GameScore     = require('../models/GameScore')
const ScribbleScore = require('../models/ScribbleScore')
const Feedback      = require('../models/Feedback')

// Safely require optional models
let Alert, Scheme
try { Alert  = require('../models/Alert')  } catch { Alert  = null }
try { Scheme = require('../models/Scheme') } catch { Scheme = null }

// ── Helpers ────────────────────────────────────────────────────────────────
async function getLinkedStudents(parent) {
  if (!parent.linkedStudentUDID) return []
  return User.find({
    udid: parent.linkedStudentUDID.trim().toUpperCase(),
    role: 'student',
  }).select('-password')
}

function last7Labels() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return days[d.getDay()]
  })
}

async function dailyCount(Model, matchQuery, n = 7) {
  // Auto-detect date field
  const sample = await Model.findOne(matchQuery).lean()
  const dateField = sample?.playedAt ? 'playedAt' : 'createdAt'

  const from = new Date()
  from.setDate(from.getDate() - (n - 1))
  from.setHours(0, 0, 0, 0)

  const raw = await Model.aggregate([
    { $match: { ...matchQuery, [dateField]: { $gte: from } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } },
      n: { $sum: 1 }
    }},
  ])
  const map = {}
  raw.forEach(r => { map[r._id] = r.n })

  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return map[d.toISOString().split('T')[0]] || 0
  })
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/children
// ─────────────────────────────────────────────────────────────────────────
exports.getChildren = async (req, res) => {
  try {
    const students = await getLinkedStudents(req.user)
    res.json({ success: true, children: students })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/overview/:studentId
// ─────────────────────────────────────────────────────────────────────────
exports.getOverview = async (req, res) => {
  try {
    const sid     = req.params.studentId
    const student = await User.findById(sid).select('-password')
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' })

    const [games, scribble] = await Promise.all([
      GameScore.find({ userId: sid }),
      ScribbleScore.find({ userId: sid }),
    ])

    const totalGames  = games.length + scribble.length
    const totalPoints = games.reduce((s, g) => s + (g.score || 0), 0)
                      + scribble.reduce((s, g) => s + (g.totalScore || 0), 0)

    // Streak
    const getDate = (g) => new Date(g.playedAt || g.createdAt).toISOString().split('T')[0]
    const allDates = new Set([...games.map(getDate), ...scribble.map(getDate)])
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (allDates.has(d.toISOString().split('T')[0])) streak++
      else if (i > 0) break
    }

    // Last seen
    const allTs = [
      ...games.map(g => new Date(g.playedAt || g.createdAt).getTime()),
      ...scribble.map(g => new Date(g.playedAt || g.createdAt).getTime()),
    ]
    const lastSeen = allTs.length ? new Date(Math.max(...allTs)) : null

    // Speech / math
    const twister    = games.filter(g => g.gameType === 'twister')
    const mathGames  = games.filter(g => g.gameType === 'math')
    const speechAccuracy = twister.length
      ? Math.min(100, Math.round(twister.reduce((s, g) => s + (g.score || 0), 0) / twister.length * 10))
      : 0
    let mathStreak = 0
    for (const g of mathGames.sort((a, b) => new Date(b.playedAt||b.createdAt) - new Date(a.playedAt||a.createdAt))) {
      if (g.score > 0) mathStreak++; else break
    }

    const studyMins    = totalGames * 5
    const studyDisplay = studyMins >= 60
      ? `${Math.floor(studyMins / 60)}h ${studyMins % 60}m`
      : `${studyMins}m`

    const [gSeries, sSeries] = await Promise.all([
      dailyCount(GameScore, { userId: sid }, 7),
      dailyCount(ScribbleScore, { userId: sid }, 7),
    ])
    const weeklySeries = gSeries.map((v, i) => v + sSeries[i])

    res.json({
      success: true,
      overview: {
        studyTime: studyDisplay,
        totalGames, totalPoints,
        lastSeen, streak,
        speechAccuracy, mathStreak,
        weeklyLabels:  last7Labels(),
        weeklySeries,
        categoryPerformance: [
          { label: 'Scribble',      pct: Math.min(100, scribble.length * 10), color: '#8B5CF6' },
          { label: 'Tongue Twister', pct: Math.min(100, twister.length * 10),  color: '#3B82F6' },
          { label: 'Mental Math',   pct: Math.min(100, mathGames.length * 10), color: '#EF4444' },
        ],
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/activity/:studentId
// ─────────────────────────────────────────────────────────────────────────
exports.getActivity = async (req, res) => {
  try {
    const sid = req.params.studentId
    const [games, scribble] = await Promise.all([
      GameScore.find({ userId: sid }).sort({ createdAt: -1 }).limit(50),
      ScribbleScore.find({ userId: sid }).sort({ createdAt: -1 }).limit(50),
    ])

    const feed = [
      ...games.map(g => ({
        type:   g.gameType,
        label:  g.gameType === 'math' ? 'Mental Math' : 'Tongue Twister',
        score:  g.score || 0,
        streak: g.streak || 0,
        date:   g.playedAt || g.createdAt,
        detail: g.gameType === 'twister'
          ? `Accuracy: ${Math.min(100, (g.score || 0) * 10)}%`
          : `Score: ${g.score || 0}`,
      })),
      ...scribble.map(g => ({
        type:   'scribble',
        label:  'Scribble',
        score:  g.totalScore || 0,
        rank:   g.rank || 0,
        date:   g.playedAt || g.createdAt,
        detail: `Rank #${g.rank || '?'} · Room ${g.roomCode || '—'}`,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))

    // 28-day heatmap
    const heatmap = {}
    for (let i = 27; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      heatmap[d.toISOString().split('T')[0]] = 0
    }
    feed.forEach(a => {
      const k = new Date(a.date).toISOString().split('T')[0]
      if (heatmap[k] !== undefined) heatmap[k]++
    })

    const weekMs = 7 * 24 * 60 * 60 * 1000
    res.json({
      success: true,
      feed: feed.slice(0, 30),
      heatmap,
      stats: {
        totalSessions: feed.length,
        thisWeek: feed.filter(f => Date.now() - new Date(f.date).getTime() < weekMs).length,
        bestStreak: Math.max(0, ...games.map(g => g.streak || 0)),
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/education/:studentId
// ─────────────────────────────────────────────────────────────────────────
exports.getEducation = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .select('educationLevel className course')
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' })

    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies']
    const colors   = ['#7C3AED', '#F97316', '#10B981', '#F59E0B']
    const quizAvgs = [78, 64, 85, 55]
    const lessons  = [8, 6, 9, 5]

    res.json({
      success: true,
      breakdown: subjects.map((s, i) => ({
        subject: s, lessonsCompleted: lessons[i],
        quizAvg: quizAvgs[i], color: colors[i],
      })),
      weeklyTrend: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: subjects.map((s, i) => ({
          label: s, color: colors[i],
          data: [[5,8,6,9],[3,5,4,7],[6,7,8,9],[2,4,3,5]][i],
        })),
      },
      quizStats: { correct: 68, wrong: 18, skipped: 14 },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/schemes/:studentId
// ─────────────────────────────────────────────────────────────────────────
exports.getSchemes = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .select('disabilityType state')
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' })

    let schemes = []
    if (Scheme) {
      schemes = await Scheme.find({
        $or: [
          { disabilityType: student.disabilityType },
          { disabilityType: 'all' },
          { disabilityType: { $exists: false } },
        ]
      }).limit(10)
    }

    res.json({
      success: true, schemes,
      studentDisability: student.disabilityType,
      studentState: student.state,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/alerts/:studentId
// ─────────────────────────────────────────────────────────────────────────
exports.getAlerts = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .select('name disabilityType state')
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' })

    let alerts = []
    if (Alert) {
      alerts = await Alert.find({ userId: req.params.studentId })
        .sort({ createdAt: -1 }).limit(20)
    }

    const tips = []
    const tipMap = {
      visual:    'Enable high contrast mode and ensure text-to-speech is active for all content.',
      hearing:   'Use Indian Sign Language (ISL) videos available in the Education section.',
      cognitive: 'Break study sessions into 15-minute focused blocks with short breaks.',
      speech:    'Practice the Tongue Twister game daily to improve speech clarity.',
    }
    tips.push(tipMap[student.disabilityType] || 'Encourage consistent daily practice with games and lessons.')
    if (student.state) tips.push(`Check government schemes available in ${student.state} for education support.`)
    tips.push(`Set a daily study reminder for ${student.name} to build a learning habit.`)

    res.json({
      success: true, alerts,
      counts: {
        active:   alerts.filter(a => a.status === 'Active').length,
        critical: alerts.filter(a => a.severity === 'critical' && a.status === 'Active').length,
        resolved: alerts.filter(a => a.status === 'Resolved').length,
      },
      aiTips: tips,
      studentName: student.name,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/parent/support  &  POST /api/parent/support
// ─────────────────────────────────────────────────────────────────────────
exports.getSupport = async (req, res) => {
  try {
    let tickets = []
    if (Feedback) {
      tickets = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 })
    }
    res.json({ success: true, tickets })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

exports.submitSupport = async (req, res) => {
  try {
    const { subject, message, category } = req.body
    if (!subject || !message)
      return res.status(400).json({ success: false, error: 'Subject and message are required' })

    if (!Feedback)
      return res.status(500).json({ success: false, error: 'Feedback model not found' })

    const ticket = await Feedback.create({
      userId:   req.user._id,
      userName: req.user.name,
      subject, message,
      category: category || 'Feedback',
    })
    res.status(201).json({ success: true, ticket })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}