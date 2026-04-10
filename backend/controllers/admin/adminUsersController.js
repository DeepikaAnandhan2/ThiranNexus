// backend/controllers/admin/adminUsersController.js
const User = require('../../models/User')
const GameScore = require('../../models/GameScore')
const ScribbleScore = require('../../models/ScribbleScore')


// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', disability = '', status = '' } = req.query
    const query = {}
    if (search)     query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { udid:  { $regex: search, $options: 'i' } },
    ]
    if (role)       query.role           = role
    if (disability) query.disabilityType = disability
    if (status === 'active')   query.isActive = true
    if (status === 'inactive') query.isActive = false

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const disabilityAgg = await User.aggregate([
      { $group: { _id: '$disabilityType', count: { $sum: 1 } } },
    ])
    const engagementAgg = await GameScore.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$user.disabilityType', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
    ])

    res.json({
      success: true,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / parseInt(limit)),
      users,
      disabilityBreakdown: disabilityAgg.map(d => ({ label: d._id || 'unknown', count: d.count })),
      engagementBreakdown: engagementAgg.map(e => ({
        label:    e._id || 'unknown',
        avgScore: Math.round(e.avgScore || 0),
        count:    e.count,
      })),
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// GET /api/admin/users/stats
exports.getUserStats = async (_req, res) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const [total, active, sessionsToday] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      GameScore.countDocuments({ playedAt: { $gte: todayStart } }),
    ])
    const perfAgg = await GameScore.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } },
    ])
    res.json({
      success: true,
      totalUsers:     total,
      activeUsers:    active,
      sessionsToday,
      avgPerformance: Math.round(perfAgg[0]?.avg || 0),
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    const [games, scribble] = await Promise.all([
      GameScore.find({ userId: user._id }).sort({ playedAt: -1 }).limit(10),
      ScribbleScore.find({ userId: user._id }).sort({ playedAt: -1 }).limit(5),
    ])
    res.json({ success: true, user, games, scribble })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowed = ['name','email','role','disabilityType','educationLevel','state','phone','isActive']
    const update  = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k] })
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    await Promise.all([
      GameScore.deleteMany({ userId: req.params.id }),
      ScribbleScore.deleteMany({ userId: req.params.id }),
    ])
    res.json({ success: true, message: 'User and all related data deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}