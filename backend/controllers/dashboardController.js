// backend/controllers/dashboardController.js

const User          = require('../models/User')
const ScribbleScore = require('../models/ScribbleScore')
const GameScore     = require('../models/GameScore')

// ── Util: last N day labels ────────────────────────────────
function lastNDayLabels(n = 7) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return days[d.getDay()]
  })
}

// ── Util: count docs per day ───────────────────────────────
async function countPerDay(Model, query, dateField = 'playedAt', n = 7) {
  const from = new Date()
  from.setDate(from.getDate() - (n - 1))
  from.setHours(0, 0, 0, 0)

  const raw = await Model.aggregate([
    { $match: { ...query, [dateField]: { $gte: from } } },
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

// ── Compute badges from real stats ────────────────────────
function computeBadges({ wins, gamesPlayed, streak, bestScore, twisterWins, mathScore }) {
  return [
    { id: 'first-win',    icon: '🏆', name: 'First Win',      desc: 'Win your first Scribble game', target: 1,   current: wins },
    { id: 'streak-5',     icon: '🔥', name: '5-Day Streak',   desc: 'Play 5 days in a row',         target: 5,   current: streak },
    { id: 'scribble-pro', icon: '🎨', name: 'Scribble Pro',   desc: 'Win 10 Scribble games',        target: 10,  current: wins },
    { id: 'twister-pro',  icon: '🗣️', name: 'Twister Master', desc: 'Score 20+ in Twister',         target: 20,  current: twisterWins || 0 },
    { id: 'math-genius',   icon: '🧮', name: 'Math Genius',    desc: 'Score 50+ in Math game',      target: 50,  current: mathScore || 0 },
    { id: 'gamer',        icon: '🕹️', name: 'Game Addict',    desc: 'Play 20 games total',          target: 20,  current: gamesPlayed },
    { id: 'high-scorer',  icon: '⚡', name: 'High Scorer',    desc: 'Score 300+ in one game',       target: 300, current: bestScore },
    { id: 'consistent',   icon: '📚', name: 'Consistent',     desc: 'Play 7 days in a row',         target: 7,   current: streak },
  ].map(b => {
    const pct   = Math.min(100, Math.round((b.current / b.target) * 100))
    const state = pct >= 100 ? 'earned' : b.current > 0 ? 'progress' : 'locked'
    return { ...b, pct, state }
  })
}

// ─────────────────────────────────────────────────────────
// GET /api/dashboard/summary
// ─────────────────────────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id.toString()

    const allScribble = await ScribbleScore.find({ userId }).sort({ playedAt: -1 })
    const gamesPlayed = allScribble.length
    const wins        = allScribble.filter(s => s.rank === 1).length
    const bestScore   = allScribble.reduce((mx, s) => Math.max(mx, s.totalScore), 0)

    // Fetch all game scores (twister + math)
    const allGameScores = await GameScore.find({ userId })
    const twisterScores = allGameScores.filter(g => g.gameType === 'twister')
    const mathScores = allGameScores.filter(g => g.gameType === 'math')
    const twisterWins = twisterScores.reduce((mx, s) => Math.max(mx, s.score), 0)
    const mathScore = mathScores.reduce((mx, s) => Math.max(mx, s.score), 0)

    // Streak calculation - combine all games
    const allGameDates = new Set([
      ...allScribble.map(s => s.playedAt.toISOString().split('T')[0]),
      ...allGameScores.map(g => g.playedAt.toISOString().split('T')[0])
    ])
    let streak = 0
    const today = new Date(); today.setHours(23,59,59,999)
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (allGameDates.has(dateStr)) streak++
      else if (i > 0) break
    }

    const gameTrend = await countPerDay(ScribbleScore, { userId }, 'playedAt', 7)

    const categoryPerformance = [
      { label: 'Mathematics',    pct: 78, color: '#7C3AED' },
      { label: 'Science',        pct: 64, color: '#F97316' },
      { label: 'English',        pct: 85, color: '#10B981' },
      { label: 'Social Studies', pct: 55, color: '#F59E0B' },
      { label: 'Scribble Game',  pct: wins > 0 ? Math.min(100, wins * 10) : 0, color: '#EC4899' },
      { label: 'Tongue Twister',  pct: twisterWins > 0 ? Math.min(100, twisterWins / 2) : 0, color: '#10B981' },
      { label: 'Mental Math',     pct: mathScore > 0 ? Math.min(100, mathScore) : 0, color: '#F97316' },
    ]

    res.json({
      success: true,
      metrics: { gamesPlayed: gamesPlayed + twisterScores.length + mathScores.length, wins, bestScore, streak, badgesEarned: computeBadges({ wins, gamesPlayed, streak, bestScore, twisterWins, mathScore }).filter(b => b.state === 'earned').length },
      trend: { labels: lastNDayLabels(7), gameSeries: gameTrend, lessonSeries: [3,5,2,6,4,7,5] },
      categoryPerformance,
      badges: computeBadges({ wins, gamesPlayed, streak, bestScore, twisterWins, mathScore }),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/dashboard/games
// ─────────────────────────────────────────────────────────
exports.getGames = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const limit  = parseInt(req.query.limit) || 10

    // Get scribble scores
    const history = await ScribbleScore
      .find({ userId })
      .sort({ playedAt: -1 })
      .limit(limit)

    // Get all game scores for Math and Twister
    const allGameScores = await GameScore.find({ userId }).sort({ playedAt: -1 }).limit(limit)
    const twisterScores = allGameScores.filter(g => g.gameType === 'twister')
    const mathScores = allGameScores.filter(g => g.gameType === 'math')

    const wins    = history.filter(s => s.rank === 1).length
    const avgScore = history.length
      ? Math.round(history.reduce((s, r) => s + r.totalScore, 0) / history.length)
      : 0

    const twisterAvg = twisterScores.length
      ? Math.round(twisterScores.reduce((s, r) => s + r.score, 0) / twisterScores.length)
      : 0

    const mathAvg = mathScores.length
      ? Math.round(mathScores.reduce((s, r) => s + r.score, 0) / mathScores.length)
      : 0

    const categoryBreakdown = [
      { game: 'Scribble',       played: history.length, wins, avgScore: avgScore || 0, color: '#7C3AED' },
      { game: 'Mental Math',    played: mathScores.length, wins: mathScores.filter(s => s.score > 0).length, avgScore: mathAvg, color: '#F97316' },
      { game: 'Tongue Twister', played: twisterScores.length, wins: twisterScores.filter(s => s.score > 0).length, avgScore: twisterAvg, color: '#10B981' },
    ]

    res.json({ success: true, history, categoryBreakdown })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/dashboard/education
// ─────────────────────────────────────────────────────────
exports.getEducation = async (req, res) => {
  try {
    const user     = req.user
    const subjects = user.educationLevel === 'school'
      ? ['Mathematics', 'Science', 'English', 'Social Studies']
      : ['Core Subject', 'Elective', 'Lab Work', 'Project']

    const colors = ['#7C3AED', '#F97316', '#10B981', '#F59E0B']

    const breakdown = subjects.map((s, i) => ({
      subject: s,
      lessonsCompleted: [8, 6, 9, 5][i],
      quizAvg: [78, 64, 85, 55][i],
      color: colors[i],
    }))

    const weeklyTrend = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: subjects.map((s, i) => ({
        label: s,
        data: [[5,8,6,9],[3,5,4,7],[6,7,8,9],[2,4,3,5]][i],
        color: colors[i],
      })),
    }

    res.json({
      success: true,
      breakdown,
      weeklyTrend,
      quizStats: { correct: 68, wrong: 18, skipped: 14 },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/dashboard/game/score
// Save game score from Tongue Twister or Math Game
// ─────────────────────────────────────────────────────────
exports.saveGameScore = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const { gameType, score, streak = 0 } = req.body
    
    if (!gameType || score === undefined) {
      return res.status(400).json({ error: 'gameType and score are required' })
    }
    
    if (!['twister', 'math', 'scribble'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType' })
    }
    
    const gameScore = await GameScore.create({
      userId,
      gameType,
      score,
      streak,
      playedAt: new Date()
    })
    
    res.json({ success: true, gameScore })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}