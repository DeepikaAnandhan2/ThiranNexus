// backend/controllers/admin/adminContentController.js
const Scheme = require('../../models/Scheme')
const GameScore = require('../../models/GameScore')


// GET /api/admin/content/schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', disability = '' } = req.query
    const query = {}
    if (search)     query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
    if (disability) query.disabilityType = disability
    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Scheme.countDocuments(query)
    const items = await Scheme.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), items })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// POST /api/admin/content/schemes
exports.createScheme = async (req, res) => {
  try {
    const { title, description, disabilityType, eligibility, benefits, documentsRequired, startDate, lastDate, applyLink } = req.body
    if (!title || !disabilityType)
      return res.status(400).json({ success: false, error: 'title and disabilityType are required' })
    const scheme = await Scheme.create({
      title, description, disabilityType,
      eligibility:       Array.isArray(eligibility)       ? eligibility       : (eligibility       ? [eligibility]       : []),
      documentsRequired: Array.isArray(documentsRequired) ? documentsRequired : (documentsRequired ? [documentsRequired] : []),
      benefits, startDate, lastDate, applyLink,
    })
    res.status(201).json({ success: true, scheme })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// PUT /api/admin/content/schemes/:id
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!scheme) return res.status(404).json({ success: false, error: 'Scheme not found' })
    res.json({ success: true, scheme })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// DELETE /api/admin/content/schemes/:id
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id)
    if (!scheme) return res.status(404).json({ success: false, error: 'Scheme not found' })
    res.json({ success: true, message: 'Scheme deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// GET /api/admin/content/game-stats
exports.getGameContentStats = async (_req, res) => {
  try {
    const [twisterStats, mathStats] = await Promise.all([
      GameScore.aggregate([{ $match: { gameType: 'twister' } }, { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$score' }, maxScore: { $max: '$score' } } }]),
      GameScore.aggregate([{ $match: { gameType: 'math' } },    { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$score' }, maxScore: { $max: '$score' } } }]),
    ])
    res.json({
      success: true,
      tonguetwister: { total: twisterStats[0]?.total||0, avgScore: Math.round(twisterStats[0]?.avgScore||0), maxScore: twisterStats[0]?.maxScore||0 },
      math:          { total: mathStats[0]?.total||0,    avgScore: Math.round(mathStats[0]?.avgScore||0),    maxScore: mathStats[0]?.maxScore||0 },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}