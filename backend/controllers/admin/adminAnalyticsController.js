// backend/controllers/admin/adminAnalyticsController.js
// FIXES:
//  1. Top Performers "Unknown": GameScore.userId is stored as STRING
//     but $lookup expects ObjectId. We convert both sides.
//  2. Disability "unknown" in Users page: same $lookup issue in adminUsersController.
//  3. Added $addFields to cast userId string → ObjectId before $lookup.

const User          = require('../../models/User')
const ScribbleScore = require('../../models/ScribbleScore')
const GameScore     = require('../../models/GameScore')
const mongoose      = require('mongoose')

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
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } }, count: { $sum: 1 } } },
  ])
  const map = {}
  raw.forEach(r => { map[r._id] = r.count })
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return map[d.toISOString().split('T')[0]] || 0
  })
}

// ── Key fix: userId in GameScore is stored as a STRING (from localStorage).
// We need to try ObjectId conversion AND string-based lookup.
async function getTopPerformers(limit = 5) {
  // Step 1: aggregate scores grouped by userId (string)
  const grouped = await GameScore.aggregate([
    {
      $group: {
        _id:        '$userId',
        totalScore: { $sum: '$score' },
        games:      { $sum: 1 },
      },
    },
    { $sort: { totalScore: -1 } },
    { $limit: limit },
  ])

  // Step 2: for each entry, try to find the user by ObjectId OR by string _id field
  const results = []
  for (const entry of grouped) {
    let user = null

    // Try ObjectId cast first
    try {
      const oid = new mongoose.Types.ObjectId(entry._id)
      user = await User.findById(oid).select('name disabilityType')
    } catch { /* not a valid ObjectId string */ }

    // Fallback: search by string _id stored as custom field (some setups store id as string)
    if (!user) {
      user = await User.findOne({ _id: entry._id }).select('name disabilityType').catch(() => null)
    }

    results.push({
      _id:            entry._id,
      name:           user?.name           || 'Unknown',
      disabilityType: user?.disabilityType || 'none',
      totalScore:     entry.totalScore,
      games:          entry.games,
    })
  }

  return results
}

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      newUsersThisWeek,
      scribbleCount,
      gameCount,
      scribbleScores,
      mathScores,
      twisterScores,
      dailyUsers,
      dailySessions,
      avgScoreByGame,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
      ScribbleScore.countDocuments(),
      GameScore.countDocuments(),
      ScribbleScore.aggregate([{ $group: { _id: null, avg: { $avg: '$totalScore' }, total: { $sum: 1 } } }]),
      GameScore.aggregate([
        { $match: { gameType: 'math' } },
        { $group: { _id: null, avg: { $avg: '$score' }, total: { $sum: 1 }, maxScore: { $max: '$score' } } },
      ]),
      GameScore.aggregate([
        { $match: { gameType: 'twister' } },
        { $group: { _id: null, avg: { $avg: '$score' }, total: { $sum: 1 } } },
      ]),
      seriesPerDay(User, {}, 'createdAt', 7),
      seriesPerDay(ScribbleScore, {}, 'playedAt', 7),
      GameScore.aggregate([
        { $group: { _id: '$gameType', avgScore: { $avg: '$score' }, total: { $sum: 1 } } },
      ]),
    ])

    const totalGames  = scribbleCount + gameCount
    const mathAvg     = mathScores[0]?.avg    || 0
    const twisterAvg  = twisterScores[0]?.avg  || 0
    const scribbleAvg = scribbleScores[0]?.avg  || 0
    const mathMax     = mathScores[0]?.maxScore || 0

    const improvementPct = totalUsers > 0
      ? Math.round((newUsersThisWeek / totalUsers) * 100)
      : 0

    const [positiveGames, totalGameSessions] = await Promise.all([
      GameScore.countDocuments({ score: { $gt: 0 } }),
      GameScore.countDocuments(),
    ])
    const successRate = totalGameSessions > 0
      ? Math.round((positiveGames / totalGameSessions) * 100)
      : 0

    // Use the fixed top performers lookup
    const topPerformers = await getTopPerformers(5)

    res.json({
      success: true,
      kpis: { successRate, improvementPct, totalUsers, totalGames, newUsersThisWeek },
      charts: {
        labels:       lastNDayLabels(7),
        dailyUsers,
        dailySessions,
        mathScores: {
          avg:    Math.round(mathAvg),
          total:  mathScores[0]?.total || 0,
          max:    mathMax,
          series: await seriesPerDay(GameScore, { gameType: 'math' }, 'playedAt', 7),
        },
        speechAccuracy: {
          avg:    Math.round(twisterAvg),
          total:  twisterScores[0]?.total || 0,
          series: await seriesPerDay(GameScore, { gameType: 'twister' }, 'playedAt', 7),
        },
        scribble: { avg: Math.round(scribbleAvg), total: scribbleScores[0]?.total || 0 },
        avgScoreByGame: avgScoreByGame.map(g => ({
          game:     g._id,
          avgScore: Math.round(g.avgScore || g.avg || 0),
          total:    g.total,
        })),
      },
      topPerformers,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: err.message })
  }
}