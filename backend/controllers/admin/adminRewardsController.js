// backend/controllers/admin/adminRewardsController.js

const GameScore = require('../../models/GameScore')
const ScribbleScore = require('../../models/ScribbleScore')


function computeBadges({ wins, gamesPlayed, bestScore, twisterTotal, mathTotal }) {
  const defs = [
    { id: 'first-win',    icon: '🏆', name: 'First Win',      target: 1,   current: wins },
    { id: 'scribble-pro', icon: '🎨', name: 'Scribble Pro',   target: 10,  current: wins },
    { id: 'twister-pro',  icon: '🗣️', name: 'Twister Master', target: 20,  current: twisterTotal },
    { id: 'math-genius',  icon: '🧮', name: 'Math Genius',    target: 50,  current: mathTotal },
    { id: 'gamer',        icon: '🕹️', name: 'Game Addict',    target: 20,  current: gamesPlayed },
    { id: 'high-scorer',  icon: '⚡', name: 'High Scorer',    target: 300, current: bestScore },
  ]
  return defs.map(b => {
    const pct = Math.min(100, Math.round((b.current / b.target) * 100))
    return { ...b, pct, state: pct >= 100 ? 'earned' : b.current > 0 ? 'progress' : 'locked' }
  })
}

exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const [gameLB, scribbleLB] = await Promise.all([
      GameScore.aggregate([
        { $group: { _id: '$userId', totalScore: { $sum: '$score' }, gamesPlayed: { $sum: 1 } } },
        { $sort: { totalScore: -1 } }, { $limit: limit },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$user.name','Unknown'] }, disabilityType: { $ifNull: ['$user.disabilityType','none'] }, totalScore: 1, gamesPlayed: 1 } },
      ]),
      ScribbleScore.aggregate([
        { $group: { _id: '$userId', scribbleScore: { $sum: '$totalScore' }, wins: { $sum: { $cond: [{ $eq: ['$rank',1] }, 1, 0] } } } },
      ]),
    ])
    const scribbleMap = {}
    scribbleLB.forEach(s => { scribbleMap[String(s._id)] = s })
    const leaderboard = gameLB.map((e, i) => {
      const scrib = scribbleMap[String(e._id)] || { scribbleScore: 0, wins: 0 }
      return { rank: i+1, userId: e._id, name: e.name, disabilityType: e.disabilityType, totalScore: e.totalScore + (scrib.scribbleScore||0), gamesPlayed: e.gamesPlayed, wins: scrib.wins||0 }
    }).sort((a,b) => b.totalScore - a.totalScore).map((e,i) => ({ ...e, rank: i+1 }))
    const [totalPointsAgg, usersPlayed, streakers] = await Promise.all([
      GameScore.aggregate([{ $group: { _id: null, sum: { $sum: '$score' } } }]),
      GameScore.distinct('userId'),
      GameScore.aggregate([
        { $group: { _id: { userId: '$userId', day: { $dateToString: { format: '%Y-%m-%d', date: '$playedAt' } } } } },
        { $group: { _id: '$_id.userId', days: { $sum: 1 } } },
        { $match: { days: { $gte: 3 } } }, { $count: 'count' },
      ]),
    ])
    res.json({ success: true, stats: { totalPoints: totalPointsAgg[0]?.sum||0, usersPlayed: usersPlayed.length, activeStreaks: streakers[0]?.count||0 }, leaderboard })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.getBadgeStats = async (_req, res) => {
  try {
    const userScores = await GameScore.aggregate([
      { $group: { _id: '$userId', totalScore: { $sum: '$score' }, gamesPlayed: { $sum: 1 }, twisterTotal: { $sum: { $cond: [{ $eq: ['$gameType','twister'] }, '$score', 0] } }, mathTotal: { $sum: { $cond: [{ $eq: ['$gameType','math'] }, '$score', 0] } }, bestScore: { $max: '$score' } } },
    ])
    const scribbleWins = await ScribbleScore.aggregate([{ $match: { rank: 1 } }, { $group: { _id: '$userId', wins: { $sum: 1 } } }])
    const winsMap = {}; scribbleWins.forEach(s => { winsMap[String(s._id)] = s.wins })
    const badgeCounts = { 'first-win': 0, 'scribble-pro': 0, 'twister-pro': 0, 'math-genius': 0, 'gamer': 0, 'high-scorer': 0 }
    for (const us of userScores) {
      computeBadges({ wins: winsMap[String(us._id)]||0, gamesPlayed: us.gamesPlayed, bestScore: us.bestScore, twisterTotal: us.twisterTotal, mathTotal: us.mathTotal })
        .filter(b => b.state === 'earned')
        .forEach(b => { if (badgeCounts[b.id] !== undefined) badgeCounts[b.id]++ })
    }
    res.json({ success: true, badgeCounts })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}