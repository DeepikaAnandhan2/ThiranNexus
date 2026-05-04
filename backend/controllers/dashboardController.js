// backend/controllers/dashboardController.js

const User          = require('../models/User')
const ScribbleScore = require('../models/ScribbleScore')
const GameScore     = require('../models/GameScore')
const Scheme        = require('../models/Scheme')
const UserScheme    = require('../models/UserScheme')
const mongoose      = require('mongoose')

function lastNDayLabels(n = 7) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return days[d.getDay()]
  })
}

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

function normalizeDisabilityType(type) {
  if (!type) return 'all'
  const t = String(type).toLowerCase()
  if (t.includes('vis')) return 'visual'
  if (t.includes('hea')) return 'hearing'
  if (t.includes('cog')) return 'cognitive'
  if (t.includes('phy')) return 'physical'
  if (t.includes('speech')) return 'speech'
  return t
}

async function resolveUser(userId) {
  if (!userId) return null
  try {
    return await User.findById(String(userId)).select('name disabilityType')
  } catch {
    return null
  }
}

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

async function buildLeaderboard(limit = 7) {
  const gameGroups = await GameScore.aggregate([
    { $group: { _id: '$userId', totalScore: { $sum: '$score' }, gamesPlayed: { $sum: 1 } } },
    { $sort: { totalScore: -1 } },
    { $limit: limit },
  ])

  const scribGroups = await ScribbleScore.aggregate([
    { $group: { _id: '$userId', scribScore: { $sum: '$totalScore' }, wins: { $sum: { $cond: [{ $eq: ['$rank', 1] }, 1, 0] } } } },
  ])

  const scribMap = {}
  scribGroups.forEach(s => { scribMap[String(s._id)] = s })

  const leaderboard = []
  for (const entry of gameGroups) {
    const person = await resolveUser(entry._id)
    const scrib = scribMap[String(entry._id)] || { scribScore: 0, wins: 0 }
    leaderboard.push({
      userId:         entry._id,
      name:           person?.name || 'Student',
      disabilityType: person?.disabilityType || 'none',
      totalScore:     entry.totalScore + (scrib.scribScore || 0),
      gamesPlayed:    entry.gamesPlayed,
      wins:           scrib.wins || 0,
    })
  }

  leaderboard.sort((a, b) => b.totalScore - a.totalScore)
  leaderboard.forEach((item, index) => { item.rank = index + 1 })

  return leaderboard
}

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const user   = req.user

    const [allScribble, allGameScores] = await Promise.all([
      ScribbleScore.find({ userId }).sort({ playedAt: -1 }),
      GameScore.find({ userId }),
    ])

    const gamesPlayed = allScribble.length
    const wins        = allScribble.filter(s => s.rank === 1).length
    const bestScore   = allScribble.reduce((mx, s) => Math.max(mx, s.totalScore), 0)

    const twisterScores = allGameScores.filter(g => g.gameType === 'twister')
    const mathScores    = allGameScores.filter(g => g.gameType === 'math')
    const twisterWins   = twisterScores.reduce((mx, s) => Math.max(mx, s.score), 0)
    const mathScore     = mathScores.reduce((mx, s) => Math.max(mx, s.score), 0)

    const allGameDates = new Set([
      ...allScribble.map(s => s.playedAt.toISOString().split('T')[0]),
      ...allGameScores.map(g => g.playedAt.toISOString().split('T')[0]),
    ])

    let streak = 0
    const today = new Date(); today.setHours(23, 59, 59, 999)
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (allGameDates.has(dateStr)) streak++
      else if (i > 0) break
    }

    const categoryPerformance = [
      { label: 'Mathematics',    pct: Math.min(100, mathScores.length * 12), color: '#7C3AED' },
      { label: 'Science',        pct: Math.min(100, allScribble.length * 8),   color: '#F97316' },
      { label: 'English',        pct: Math.min(100, twisterScores.length * 10), color: '#10B981' },
      { label: 'Scribble',       pct: Math.min(100, wins * 12),               color: '#EC4899' },
    ]

    const leaderboard = await buildLeaderboard(7)

    res.json({
      success: true,
      metrics: {
        gamesPlayed: gamesPlayed + twisterScores.length + mathScores.length,
        wins,
        bestScore,
        streak,
        badgesEarned: computeBadges({ wins, gamesPlayed, streak, bestScore, twisterWins, mathScore }).filter(b => b.state === 'earned').length,
      },
      categoryPerformance,
      badges: computeBadges({ wins, gamesPlayed, streak, bestScore, twisterWins, mathScore }),
      leaderboard,
      quickInsights: {
        nextGoal: twisterScores.length < 3 ? 'Play a Twister challenge' : 'Keep your streak alive',
        strength: mathScore >= 40 ? 'Math reasoning' : 'Spelling and vocabulary',
        tip: user.educationLevel === 'school' ? 'Try a new lesson in Science today' : 'Review your latest project notes',
      },
      trend: { labels: lastNDayLabels(7), gameSeries: await countPerDay(ScribbleScore, { userId }, 'playedAt', 7) },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getGames = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const limit  = parseInt(req.query.limit) || 10

    const [history, allGameScores] = await Promise.all([
      ScribbleScore.find({ userId }).sort({ playedAt: -1 }).limit(limit),
      GameScore.find({ userId }).sort({ playedAt: -1 }).limit(limit),
    ])

    const twisterScores = allGameScores.filter(g => g.gameType === 'twister')
    const mathScores    = allGameScores.filter(g => g.gameType === 'math')

    const avgScore = history.length ? Math.round(history.reduce((sum, item) => sum + item.totalScore, 0) / history.length) : 0
    const mathAvg  = mathScores.length ? Math.round(mathScores.reduce((sum, item) => sum + item.score, 0) / mathScores.length) : 0
    const twisterAvg = twisterScores.length ? Math.round(twisterScores.reduce((sum, item) => sum + item.score, 0) / twisterScores.length) : 0

    const categoryBreakdown = [
      { game: 'Scribble', played: history.length, wins: history.filter(s => s.rank === 1).length, avgScore, color: '#7C3AED' },
      { game: 'Mental Math', played: mathScores.length, wins: mathScores.filter(s => s.score >= 20).length, avgScore: mathAvg, color: '#F97316' },
      { game: 'Tongue Twister', played: twisterScores.length, wins: twisterScores.filter(s => s.score >= 18).length, avgScore: twisterAvg, color: '#10B981' },
    ]

    res.json({ success: true, history, categoryBreakdown })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getEducation = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const [allGameScores, scribbleHistory] = await Promise.all([
      GameScore.find({ userId }),
      ScribbleScore.find({ userId }),
    ])

    const mathScores    = allGameScores.filter(g => g.gameType === 'math')
    const twisterScores = allGameScores.filter(g => g.gameType === 'twister')

    const subjects = req.user.educationLevel === 'school'
      ? ['Mathematics', 'Science', 'English', 'Social Studies']
      : ['Core Subject', 'Electives', 'Lab Work', 'Projects']

    const colors = ['#7C3AED', '#F97316', '#10B981', '#F59E0B']

    const mathAvg    = mathScores.length ? Math.round(mathScores.reduce((sum, item) => sum + item.score, 0) / mathScores.length) : 0
    const twisterAvg = twisterScores.length ? Math.round(twisterScores.reduce((sum, item) => sum + item.score, 0) / twisterScores.length) : 0
    const scribbleAvg = scribbleHistory.length ? Math.round(scribbleHistory.reduce((sum, item) => sum + item.totalScore, 0) / scribbleHistory.length) : 0
    const totalSessions = mathScores.length + twisterScores.length + scribbleHistory.length
    const averageScore = totalSessions ? Math.round((mathAvg + twisterAvg + scribbleAvg) / 3) : 0

    const breakdown = subjects.map((subject, idx) => {
      const subjectAvg = idx === 0 ? mathAvg : idx === 1 ? scribbleAvg : idx === 2 ? twisterAvg : averageScore
      const sessionsForSubject = idx === 0 ? mathScores.length : idx === 1 ? scribbleHistory.length : idx === 2 ? twisterScores.length : Math.round(totalSessions / 4)
      return {
        subject,
        lessonsCompleted: Math.min(12, Math.max(0, Math.round(sessionsForSubject * 2))),
        quizAvg: Math.min(100, Math.max(0, subjectAvg)),
        color: colors[idx],
      }
    })

    const [mathDaily, twisterDaily, scribbleDaily] = await Promise.all([
      countPerDay(GameScore, { userId, gameType: 'math' }, 'playedAt', 28),
      countPerDay(GameScore, { userId, gameType: 'twister' }, 'playedAt', 28),
      countPerDay(ScribbleScore, { userId }, 'playedAt', 28),
    ])

    const weeklyTrend = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        { label: subjects[0], color: colors[0], data: [mathDaily.slice(0,7).reduce((a,b)=>a+b,0), mathDaily.slice(7,14).reduce((a,b)=>a+b,0), mathDaily.slice(14,21).reduce((a,b)=>a+b,0), mathDaily.slice(21,28).reduce((a,b)=>a+b,0)] },
        { label: subjects[1], color: colors[1], data: [scribbleDaily.slice(0,7).reduce((a,b)=>a+b,0), scribbleDaily.slice(7,14).reduce((a,b)=>a+b,0), scribbleDaily.slice(14,21).reduce((a,b)=>a+b,0), scribbleDaily.slice(21,28).reduce((a,b)=>a+b,0)] },
        { label: subjects[2], color: colors[2], data: [twisterDaily.slice(0,7).reduce((a,b)=>a+b,0), twisterDaily.slice(7,14).reduce((a,b)=>a+b,0), twisterDaily.slice(14,21).reduce((a,b)=>a+b,0), twisterDaily.slice(21,28).reduce((a,b)=>a+b,0)] },
      ],
    }

    const correct = totalSessions ? Math.min(100, Math.round(((mathScores.length + twisterScores.length) / totalSessions) * 100)) : 0
    const wrong = totalSessions ? Math.min(100, Math.round((scribbleHistory.length / totalSessions) * 100)) : 0
    const skipped = Math.max(0, 100 - correct - wrong)

    res.json({
      success: true,
      breakdown,
      weeklyTrend,
      quizStats: { correct, wrong, skipped },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getSchemes = async (req, res) => {
  try {
    const user     = req.user
    const userType = normalizeDisabilityType(user.disabilityType)
    const allSchemes = await Scheme.find()
    const userSchemes = await UserScheme.find({ userId: user._id }).populate('schemeId')

    const schemeStatus = {}
    userSchemes.forEach(entry => {
      if (entry.schemeId && entry.schemeId._id) {
        schemeStatus[entry.schemeId._id.toString()] = entry.status
      }
    })

    const isGeneralUser = ['none', 'other'].includes(userType)
    const filtered = allSchemes.filter(s => {
      const schemeType = normalizeDisabilityType(s.disabilityType)
      if (schemeType === 'all') return true
      if (isGeneralUser) return true
      return schemeType === userType
    })

    const sorted = filtered.sort((a, b) => {
      const aType = normalizeDisabilityType(a.disabilityType)
      const bType = normalizeDisabilityType(b.disabilityType)
      if (aType === userType && bType !== userType) return -1
      if (bType === userType && aType !== userType) return 1
      if (aType === 'all' && bType !== 'all') return -1
      if (bType === 'all' && aType !== 'all') return 1
      return 0
    })

    const schemes = sorted.slice(0, 6).map(s => ({
      _id: s._id,
      title: s.title,
      description: s.description,
      disabilityType: s.disabilityType,
      eligibility: s.eligibility,
      benefits: s.benefits,
      status: schemeStatus[s._id.toString()] || 'new',
    }))

    const counts = {
      matched: schemes.length,
      saved: Object.values(schemeStatus).filter(status => status === 'saved').length,
      applied: Object.values(schemeStatus).filter(status => status === 'applied').length,
    }

    res.json({ success: true, schemes, counts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await buildLeaderboard(10)
    res.json({ success: true, leaderboard })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

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
      playedAt: new Date(),
    })

    res.json({ success: true, gameScore })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
