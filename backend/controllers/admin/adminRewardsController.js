// backend/controllers/admin/adminRewardsController.js
// FIX: Leaderboard shows "Unknown" because GameScore.userId is a string,
// not an ObjectId, so $lookup fails silently.
// Fix: manual per-entry user resolution (same pattern as analytics fix).

const GameScore     = require('../../models/GameScore')
const ScribbleScore = require('../../models/ScribbleScore')
const User          = require('../../models/User')
const mongoose      = require('mongoose')

async function resolveUser(userId) {
  if (!userId) return null
  try {
    return await User.findById(new mongoose.Types.ObjectId(String(userId))).select('name disabilityType')
  } catch {
    return null
  }
}

function computeBadgesForUser({ wins, gamesPlayed, streak, bestScore, twisterTotal, mathTotal }) {
  const defs = [
    { id: 'first-win',    icon: '🏆', name: 'First Win',      target: 1,   current: wins },
    { id: 'streak-5',     icon: '🔥', name: '5-Day Streak',   target: 5,   current: streak },
    { id: 'scribble-pro', icon: '🎨', name: 'Scribble Pro',   target: 10,  current: wins },
    { id: 'twister-pro',  icon: '🗣️', name: 'Twister Master', target: 20,  current: twisterTotal },
    { id: 'math-genius',  icon: '🧮', name: 'Math Genius',    target: 50,  current: mathTotal },
    { id: 'gamer',        icon: '🕹️', name: 'Game Addict',    target: 20,  current: gamesPlayed },
    { id: 'high-scorer',  icon: '⚡', name: 'High Scorer',    target: 300, current: bestScore },
  ]
  return defs.map(b => {
    const pct   = Math.min(100, Math.round((b.current / b.target) * 100))
    const state = pct >= 100 ? 'earned' : b.current > 0 ? 'progress' : 'locked'
    return { ...b, pct, state }
  })
}

// GET /api/admin/rewards/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query

    // ── Step 1: group GameScore by userId (string) ──
    const gameGroups = await GameScore.aggregate([
      { $group: { _id: '$userId', totalScore: { $sum: '$score' }, gamesPlayed: { $sum: 1 } } },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) },
    ])

    // ── Step 2: group ScribbleScore by userId (string) ──
    const scribGroups = await ScribbleScore.aggregate([
      { $group: { _id: '$userId', scribScore: { $sum: '$totalScore' }, wins: { $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] } } } },
    ])
    const scribMap = {}
    scribGroups.forEach(s => { scribMap[String(s._id)] = s })

    // ── Step 3: resolve each userId to a real User ──
    const leaderboard = []
    for (const entry of gameGroups) {
      const user  = await resolveUser(entry._id)
      const scrib = scribMap[String(entry._id)] || { scribScore: 0, wins: 0 }
      leaderboard.push({
        userId:         entry._id,
        name:           user?.name           || 'Student',
        disabilityType: user?.disabilityType || 'none',
        totalScore:     entry.totalScore + (scrib.scribScore || 0),
        gamesPlayed:    entry.gamesPlayed,
        wins:           scrib.wins || 0,
      })
    }

    // Re-sort and assign ranks after merging scribble scores
    leaderboard.sort((a, b) => b.totalScore - a.totalScore)
    leaderboard.forEach((e, i) => { e.rank = i + 1 })

    // ── Platform-wide stats ──
    const [totalPointsAgg, playerIds, streakAgg] = await Promise.all([
      GameScore.aggregate([{ $group: { _id: null, sum: { $sum: '$score' } } }]),
      GameScore.distinct('userId'),
      GameScore.aggregate([
        { $group: { _id: { userId: '$userId', day: { $dateToString: { format: '%Y-%m-%d', date: '$playedAt' } } } } },
        { $group: { _id: '$_id.userId', days: { $sum: 1 } } },
        { $match: { days: { $gte: 3 } } },
        { $count: 'count' },
      ]),
    ])

    res.json({
      success: true,
      stats: {
        totalPoints:  totalPointsAgg[0]?.sum || 0,
        usersPlayed:  playerIds.length,
        activeStreaks: streakAgg[0]?.count || 0,
      },
      leaderboard,
    })
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/rewards/badges
exports.getBadgeStats = async (req, res) => {
  try {
    const userScores = await GameScore.aggregate([
      {
        $group: {
          _id:          '$userId',
          totalScore:   { $sum: '$score' },
          gamesPlayed:  { $sum: 1 },
          twisterTotal: { $sum: { $cond: [{ $eq: ['$gameType', 'twister'] }, '$score', 0] } },
          mathTotal:    { $sum: { $cond: [{ $eq: ['$gameType', 'math'] }, '$score', 0] } },
          bestScore:    { $max: '$score' },
        },
      },
    ])

    const scribbleWins = await ScribbleScore.aggregate([
      { $match: { rank: 1 } },
      { $group: { _id: '$userId', wins: { $sum: 1 } } },
    ])
    const winsMap = {}
    scribbleWins.forEach(s => { winsMap[String(s._id)] = s.wins })

    const badgeCounts = {
      'first-win': 0, 'streak-5': 0, 'scribble-pro': 0,
      'twister-pro': 0, 'math-genius': 0, 'gamer': 0, 'high-scorer': 0,
    }

    for (const us of userScores) {
      const badges = computeBadgesForUser({
        wins:         winsMap[String(us._id)] || 0,
        gamesPlayed:  us.gamesPlayed,
        streak:       0,
        bestScore:    us.bestScore,
        twisterTotal: us.twisterTotal,
        mathTotal:    us.mathTotal,
      })
      badges.filter(b => b.state === 'earned').forEach(b => {
        if (badgeCounts[b.id] !== undefined) badgeCounts[b.id]++
      })
    }

    res.json({ success: true, badgeCounts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}