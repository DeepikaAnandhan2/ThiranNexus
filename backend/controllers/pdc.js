const User        = require('../models/User')
const ActivityLog = require('../models/ActivityLog')
const ScribbleScore = require('../models/ScribbleScore')

// ── Helper: get date N days ago ────────────────────────────
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

// ─────────────────────────────────────────────────────────
// GET /api/dashboard/child/:userId
// Full dashboard data for a child
// ─────────────────────────────────────────────────────────
const getChildDashboard = async (req, res) => {
  try {
    const { userId } = req.params

    // 1. Child profile
    const child = await User.findById(userId).select('-password')
    if (!child) return res.status(404).json({ error: 'Student not found' })

    // 2. Last 7 days activity
    const weekAgo = daysAgo(7)
    const activities = await ActivityLog.find({
      userId, date: { $gte: weekAgo }
    }).sort({ date: -1 })

    // 3. Study stats
    const studyLogs  = activities.filter(a => a.type === 'study')
    const totalStudyMins = studyLogs.reduce((sum, a) => sum + (a.durationMins || 0), 0)
    const subjectsTouched = [...new Set(studyLogs.map(a => a.subject).filter(Boolean))]

    // 4. Game stats
    const twisters = activities.filter(a => a.type === 'game_twister')
    const maths    = activities.filter(a => a.type === 'game_math')
    const scribbles= activities.filter(a => a.type === 'game_scribble')

    const avgAccuracy = twisters.length
      ? Math.round(twisters.reduce((s,a) => s + a.accuracy, 0) / twisters.length)
      : 0

    const bestMathStreak = maths.length
      ? Math.max(...maths.map(a => a.streak))
      : 0

    const totalGameScore = [...twisters, ...maths, ...scribbles]
      .reduce((s, a) => s + (a.score || 0), 0)

    // 5. Daily activity (last 7 days) for chart
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const weeklyChart = []
    for (let i = 6; i >= 0; i--) {
      const day   = daysAgo(i)
      const next  = new Date(day); next.setDate(next.getDate() + 1)
      const dayLogs = activities.filter(a => {
        const d = new Date(a.date)
        return d >= day && d < next
      })
      const mins = dayLogs.reduce((s, a) => s + (a.durationMins || 0), 0)
      const games= dayLogs.filter(a => a.type.startsWith('game_')).length
      weeklyChart.push({
        day:       days[day.getDay()],
        date:      day.toISOString().split('T')[0],
        studyMins: mins,
        gamesPlayed: games,
        active:    dayLogs.length > 0,
      })
    }

    // 6. Last login
    const lastLogin = activities.find(a => a.type === 'login')
    const daysSinceLogin = lastLogin
      ? Math.floor((Date.now() - new Date(lastLogin.date)) / (1000*60*60*24))
      : null

    // 7. Notifications
    const notifications = []
    if (daysSinceLogin !== null && daysSinceLogin >= 2) {
      notifications.push({
        type: 'warning',
        icon: '⚠️',
        message: `${child.name} hasn't logged in for ${daysSinceLogin} day${daysSinceLogin>1?'s':''}.`,
        time: 'Recent',
      })
    }
    if (twisters.length > 0) {
      notifications.push({
        type: 'success',
        icon: '🌀',
        message: `${child.name} played ${twisters.length} Tongue Twister round${twisters.length>1?'s':''} this week.`,
        time: 'This week',
      })
    }
    if (maths.length > 0) {
      notifications.push({
        type: 'success',
        icon: '🧮',
        message: `Best Math streak this week: ${bestMathStreak} 🔥`,
        time: 'This week',
      })
    }
    if (totalStudyMins > 60) {
      notifications.push({
        type: 'info',
        icon: '📚',
        message: `${child.name} studied for ${Math.round(totalStudyMins/60)} hour${totalStudyMins>120?'s':''} this week.`,
        time: 'This week',
      })
    }

    res.json({
      success: true,
      child: {
        id:                child._id,
        name:              child.name,
        email:             child.email,
        udid:              child.udid,
        disabilityType:    child.disabilityType,
        disabilityDetails: child.disabilityDetails,
        educationLevel:    child.educationLevel,
        className:         child.className,
        course:            child.course,
        state:             child.state,
        createdAt:         child.createdAt,
      },
      stats: {
        totalStudyMins,
        totalStudyHours: +(totalStudyMins / 60).toFixed(1),
        subjectsTouched,
        totalGameScore,
        avgAccuracy,
        bestMathStreak,
        twisters:  { played: twisters.length,  avgAccuracy },
        math:      { played: maths.length,      bestStreak: bestMathStreak },
        scribble:  { played: scribbles.length },
        daysSinceLogin,
      },
      weeklyChart,
      notifications,
      recentActivity: activities.slice(0, 10).map(a => ({
        type:     a.type,
        subject:  a.subject,
        gameName: a.gameName,
        score:    a.score,
        duration: a.durationMins,
        date:     a.date,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/dashboard/log
// Log a student activity (called from game/education pages)
// ─────────────────────────────────────────────────────────
const logActivity = async (req, res) => {
  try {
    const log = await ActivityLog.create(req.body)
    res.status(201).json({ success: true, log })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/dashboard/parent/:parentId
// Get parent's linked children
// ─────────────────────────────────────────────────────────
const getParentChildren = async (req, res) => {
  try {
    console.log("getParentChildren called with:", req.params.parentId)
    const parent = await User.findById(req.params.parentId).select('-password')
    console.log("Parent found:", parent?.name, "role:", parent?.role)
    if (!parent) return res.status(404).json({ error: 'Parent not found' })

    // Find children linked by UDID or by parentId field
    let children = []
    if (parent.linkedStudentUDID) {
      console.log("Looking for child with UDID:", parent.linkedStudentUDID)
      const child = await User.findOne({ udid: parent.linkedStudentUDID }).select('-password')
      if (child) {
        console.log("Found child by UDID:", child.name)
        children = [child]
      }
    }

    // Also search by email domain or name match (fallback for demo)
    if (children.length === 0) {
      console.log("No linked child, searching for students...")
      children = await User.find({ role: 'student' })
        .select('name udid disabilityType educationLevel className state createdAt')
        .limit(5)
      console.log("Found students:", children.length)
    }

    res.json({ success: true, children })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getChildDashboard, logActivity, getParentChildren }