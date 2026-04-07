// backend/controllers/admin/adminDashboardController.js
const User = require('../../models/User')
const GameScore = require('../../models/GameScore')


function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function lastNDayLabels(n = 7) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return days[d.getDay()]
  })
}

async function seriesPerDay(Model, matchQuery, dateField, n = 7) {
  const from = daysAgo(n - 1)
  const raw  = await Model.aggregate([
    { $match: { ...matchQuery, [dateField]: { $gte: from } } },
    {
      $group: {
        _id:   { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
  ])
  const map = {}
  raw.forEach(r => { map[r._id] = r.count })
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return map[d.toISOString().split('T')[0]] || 0
  })
}

// GET /api/admin/dashboard/overview
exports.getOverview = async (_req, res) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      activeUsers,
      sessionsToday,
      recentUsers,
      userSeries,
      sessionSeries,
      disabilityAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      GameScore.countDocuments({ playedAt: { $gte: todayStart } }),
      User.find().sort({ createdAt: -1 }).limit(8).select('name email disabilityType createdAt'),
      seriesPerDay(User, {}, 'createdAt', 7),
      seriesPerDay(GameScore, {}, 'playedAt', 7),
      User.aggregate([
        { $match: { disabilityType: { $ne: null } } },
        { $group: { _id: '$disabilityType', count: { $sum: 1 } } },
      ]),
    ])

    // avg performance across all game scores
    const perfAgg = await GameScore.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } },
    ])
    const performancePct = Math.round(perfAgg[0]?.avg || 0)

    res.json({
      success: true,
      stats: { totalUsers, activeUsers, sessionsToday, performancePct },
      trend: {
        labels:        lastNDayLabels(7),
        userSeries,
        sessionSeries,
      },
      disabilityBreakdown: disabilityAgg.map(d => ({
        label: d._id,
        count: d.count,
      })),
      recentUsers: recentUsers.map(u => ({
        _id:            u._id,
        name:           u.name,
        email:          u.email,
        disabilityType: u.disabilityType,
        joinedAt:       u.createdAt,
      })),
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}