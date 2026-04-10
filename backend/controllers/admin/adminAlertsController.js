// backend/controllers/admin/adminAlertsController.js
const User = require('../../models/User')
const GameScore = require('../../models/GameScore')
const Alert = require('../../models/Alert')


async function autoGenerateAlerts() {
  const cutoff3 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const recentPlayers = await GameScore.distinct('userId', { playedAt: { $gte: cutoff3 } })
  const activePlayers = new Set(recentPlayers.map(String))
  const allUsers = await User.find({ createdAt: { $lt: cutoff3 }, role: { $in: ['student','user'] } }).select('_id name')
  for (const user of allUsers) {
    if (!activePlayers.has(String(user._id))) {
      const exists = await Alert.findOne({ userId: user._id, alert: 'Inactive for 3 days', status: 'Active' })
      if (!exists) await Alert.create({ userId: user._id, userName: user.name, alert: 'Inactive for 3 days', type: 'Warning', severity: 'warning' })
    }
  }
  const lowPerf = await GameScore.aggregate([
    { $match: { gameType: 'math' } },
    { $group: { _id: '$userId', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    { $match: { avgScore: { $lt: 2 }, count: { $gte: 3 } } },
  ])
  for (const lp of lowPerf) {
    const user = await User.findById(lp._id).select('name')
    if (!user) continue
    const exists = await Alert.findOne({ userId: lp._id, alert: 'Low Performance (Math)', status: 'Active' })
    if (!exists) await Alert.create({ userId: lp._id, userName: user.name, alert: 'Low Performance (Math)', type: 'Info', severity: 'info' })
  }
}

exports.getAlerts = async (req, res) => {
  try {
    await autoGenerateAlerts()
    const { status = '', severity = '', page = 1, limit = 50 } = req.query
    const query = {}
    if (status)   query.status   = status
    if (severity) query.severity = severity
    const total  = await Alert.countDocuments(query)
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).skip((parseInt(page)-1)*parseInt(limit)).limit(parseInt(limit)).populate('userId','name email disabilityType')
    const [critical, warning, info, resolved] = await Promise.all([
      Alert.countDocuments({ severity: 'critical', status: 'Active' }),
      Alert.countDocuments({ severity: 'warning',  status: 'Active' }),
      Alert.countDocuments({ severity: 'info',     status: 'Active' }),
      Alert.countDocuments({ status: 'Resolved' }),
    ])
    res.json({ success: true, total, counts: { critical, warning, info, resolved }, alerts })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.createAlert = async (req, res) => {
  try {
    const { userId, alert: alertText, type, severity } = req.body
    const user = await User.findById(userId).select('name')
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    const alert = await Alert.create({ userId, userName: user.name, alert: alertText, type: type||'Info', severity: severity||'info' })
    res.status(201).json({ success: true, alert })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { status: 'Resolved', resolvedAt: new Date() }, { new: true })
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' })
    res.json({ success: true, alert })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Alert deleted' })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}