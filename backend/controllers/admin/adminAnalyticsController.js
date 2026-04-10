// backend/controllers/admin/adminAnalyticsController.js
const User = require('../../models/User')
const GameScore = require('../../models/GameScore')
const ScribbleScore = require('../../models/ScribbleScore')


function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d
}
function lastNDayLabels(n = 7) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return days[d.getDay()]
  })
}
async function seriesPerDay(Model, matchQuery, dateField, n = 7) {
  const from = daysAgo(n - 1)
  const raw  = await Model.aggregate([
    { $match: { ...matchQuery, [dateField]: { $gte: from } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } }, count: { $sum: 1 } } },
  ])
  const map = {}; raw.forEach(r => { map[r._id] = r.count })
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return map[d.toISOString().split('T')[0]] || 0
  })
}

// GET /api/admin/analytics
exports.getAnalytics = async (_req, res) => {
  try {
    const [
      totalUsers,
      newUsersThisWeek,
      mathAgg,
      twisterAgg,
      scribbleAgg,
      topScorers,
      avgScoreByGame,
      dailyUsers,
      dailySessions,
      mathSeries,
      twisterSeries,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: daysAgo(7) } }),

      GameScore.aggregate([
        { $match: { gameType: 'math' } },
        { $group: { _id: null, avg: { $avg: '$score' }, total: { $sum: 1 }, max: { $max: '$score' } } },
      ]),
      GameScore.aggregate([
        { $match: { gameType: 'twister' } },
        { $group: { _id: null, avg: { $avg: '$score' }, total: { $sum: 1 } } },
      ]),
      ScribbleScore.aggregate([
        { $group: { _id: null, avg: { $avg: '$totalScore' }, total: { $sum: 1 } } },
      ]),

      // Top 5 by total game score
      GameScore.aggregate([
        { $group: { _id: '$userId', totalScore: { $sum: '$score' }, games: { $sum: 1 } } },
        { $sort: { totalScore: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$u.name','Unknown'] }, disabilityType: { $ifNull: ['$u.disabilityType','none'] }, totalScore: 1, games: 1 } },
      ]),

      GameScore.aggregate([
        { $group: { _id: '$gameType', avgScore: { $avg: '$score' }, total: { $sum: 1 } } },
      ]),

      seriesPerDay(User,       {},              'createdAt', 7),
      seriesPerDay(GameScore,  {},              'playedAt',  7),
      seriesPerDay(GameScore,  { gameType: 'math' },    'playedAt', 7),
      seriesPerDay(GameScore,  { gameType: 'twister' }, 'playedAt', 7),
    ])

    const totalGameSessions = await GameScore.countDocuments()
    const positiveGames     = await GameScore.countDocuments({ score: { $gt: 0 } })
    const successRate        = totalGameSessions > 0
      ? Math.round((positiveGames / totalGameSessions) * 100) : 0
    const improvementPct     = totalUsers > 0
      ? Math.round((newUsersThisWeek / totalUsers) * 100) : 0

    res.json({
      success: true,
      kpis: { successRate, improvementPct, totalUsers, totalGames: totalGameSessions, newUsersThisWeek },
      charts: {
        labels: lastNDayLabels(7),
        dailyUsers,
        dailySessions,
        mathScores:    { avg: Math.round(mathAgg[0]?.avg||0),    total: mathAgg[0]?.total||0,    max: mathAgg[0]?.max||0,    series: mathSeries },
        speechAccuracy:{ avg: Math.round(twisterAgg[0]?.avg||0), total: twisterAgg[0]?.total||0, series: twisterSeries },
        scribble:      { avg: Math.round(scribbleAgg[0]?.avg||0),total: scribbleAgg[0]?.total||0 },
        avgScoreByGame: avgScoreByGame.map(g => ({ game: g._id, avgScore: Math.round(g.avgScore||0), total: g.total })),
      },
      topPerformers: topScorers,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}