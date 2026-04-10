// backend/controllers/admin/adminSettingsController.js
const User = require('../../models/User')
const GameScore = require('../../models/GameScore')
const Scheme = require('../../models/Scheme')
const Admin = require('../../models/Admin')
const Feedback = require('../../models/Feedback')


exports.getAllAdmins = async (_req, res) => {
  try {
    const admins = await Admin.find().select('-__v').sort({ createdAt: -1 })
    res.json({ success: true, admins })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, role } = req.body
    if (!name || !email) return res.status(400).json({ success: false, error: 'name and email required' })
    const exists = await Admin.findOne({ email })
    if (exists) return res.status(400).json({ success: false, error: 'Email already registered' })
    const admin = await Admin.create({ name, email, role: role||'admin' })
    res.status(201).json({ success: true, admin })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.updateAdmin = async (req, res) => {
  try {
    const { name, role, status } = req.body
    const update = {}
    if (name)   update.name   = name
    if (role)   update.role   = role
    if (status) update.status = status
    const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!admin) return res.status(404).json({ success: false, error: 'Admin not found' })
    res.json({ success: true, admin })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Admin deleted' })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}

exports.getPlatformInfo = async (_req, res) => {
  try {
    const [totalUsers, totalGames, totalSchemes, totalAdmins] = await Promise.all([
      User.countDocuments(),
      GameScore.countDocuments(),
      Scheme.countDocuments(),
      Admin.countDocuments(),
    ])
    res.json({
      success: true,
      platform: {
        name:    'ThiranNexus',
        version: 'v2.4.1',
        stats:   { totalUsers, totalGames, totalSchemes, totalAdmins },
      },
    })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
}