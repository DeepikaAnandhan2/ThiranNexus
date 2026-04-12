// backend/controllers/admin/adminUsersController.js
// FIX: "unknown" in Avg Score by Disability chart.
// Root cause: GameScore.userId is stored as a STRING (from localStorage myId),
// but $lookup from 'users' uses ObjectId. The join silently fails → "unknown".
// Fix: after grouping by userId, manually fetch each User with a try/catch ObjectId cast.

const User          = require('../../models/User')
const ScribbleScore = require('../../models/ScribbleScore')
const GameScore     = require('../../models/GameScore')
const mongoose      = require('mongoose')

// ── Shared helper: resolve userId string → User document ──
async function resolveUser(userId) {
  if (!userId) return null
  try {
    return await User.findById(new mongoose.Types.ObjectId(String(userId))).select('name disabilityType email role state createdAt')
  } catch {
    return null
  }
}

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', disability = '', status = '' } = req.query

    const query = {}
    if (search)     query.$or            = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { udid: { $regex: search, $options: 'i' } }]
    if (role)       query.role           = role
    if (disability) query.disabilityType = disability
    if (status === 'active')   query.updatedAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    if (status === 'inactive') query.updatedAt = { $lt:  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await User.countDocuments(query)
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-password')

    // Disability breakdown
    const disabilityAgg = await User.aggregate([
      { $group: { _id: '$disabilityType', count: { $sum: 1 } } },
    ])
    const disabilityBreakdown = disabilityAgg.map(d => ({ label: d._id || 'unknown', count: d.count }))

    // ── FIX: Engagement by disability using manual user resolution ──
    // GameScore.userId is a string → can't $lookup directly on ObjectId.
    const allGameScores = await GameScore.aggregate([
      { $group: { _id: '$userId', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    ])

    const engagementByDisability = {}
    for (const gs of allGameScores) {
      const user = await resolveUser(gs._id)
      const dtype = user?.disabilityType || 'unknown'
      if (!engagementByDisability[dtype]) {
        engagementByDisability[dtype] = { sum: 0, count: 0 }
      }
      engagementByDisability[dtype].sum   += gs.avgScore * gs.count
      engagementByDisability[dtype].count += gs.count
    }

    const engagementBreakdown = Object.entries(engagementByDisability).map(([label, v]) => ({
      label,
      avgScore: Math.round(v.count > 0 ? v.sum / v.count : 0),
      count:    v.count,
    }))

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), users, disabilityBreakdown, engagementBreakdown })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    const [scribble, games] = await Promise.all([
      ScribbleScore.find({ userId: String(user._id) }).sort({ playedAt: -1 }).limit(5),
      GameScore.find({ userId: String(user._id) }).sort({ playedAt: -1 }).limit(10),
    ])
    res.json({ success: true, user, scribble, games })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowed = ['name','email','role','disabilityType','educationLevel','state','className','course','phone']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const [total, active, byDisability, byRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.aggregate([{ $group: { _id: '$disabilityType', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ])
    res.json({
      success: true,
      total,
      active,
      byDisability: byDisability.map(d => ({ label: d._id || 'unknown', count: d.count })),
      byRole:       byRole.map(r => ({ label: r._id || 'unknown', count: r.count })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    await Promise.all([
      ScribbleScore.deleteMany({ userId: String(req.params.id) }),
      GameScore.deleteMany({ userId: String(req.params.id) }),
    ])
    res.json({ success: true, message: 'User and related data deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}