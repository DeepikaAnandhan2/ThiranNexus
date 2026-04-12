// backend/controllers/authController.js  ← REPLACE ENTIRE FILE
const User = require('../models/User')
const jwt  = require('jsonwebtoken')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

const formatUser = (user) => ({
  _id: user._id, id: user._id, name: user.name, email: user.email,
  phone: user.phone, role: user.role, udid: user.udid,
  disabilityType: user.disabilityType, disabilityDetails: user.disabilityDetails,
  educationLevel: user.educationLevel, className: user.className,
  subject: user.subject, course: user.course,
  state: user.state, district: user.district,
  linkedStudentUDID: user.linkedStudentUDID, createdAt: user.createdAt,
})

// GET /api/auth/verify-udid/:udid
// ?mode=parent  -> preview existing student (for parent registration step)
// (no mode)     -> validate prefix for new student
const verifyUDID = async (req, res) => {
  try {
    const udid = (req.params.udid || '').toUpperCase().trim()

    if (req.query.mode === 'parent') {
      const student = await User.findOne({ udid, role: 'student' })
      if (!student) {
        return res.status(404).json({
          valid: false,
          error: 'No student found with this UDID. The student must register first.',
        })
      }
      return res.json({
        success: true, valid: true,
        studentName: student.name,
        disabilityType: student.disabilityType,
        educationLevel: student.educationLevel,
      })
    }

    const existing = await User.findOne({ udid, role: 'student' })
    if (existing) return res.status(400).json({ valid: false, error: 'UDID already registered' })

    const PREFIXES = { VIS:'visual', HEA:'hearing', COG:'cognitive', PHY:'physical', SPE:'speech' }
    const prefix = udid.slice(0, 3)
    const type   = PREFIXES[prefix]
    if (!type) return res.status(400).json({ valid: false, error: 'Invalid UDID prefix. Allowed: VIS, HEA, COG, PHY, SPE' })

    res.json({ success: true, valid: true, disabilityType: type, disabilityDetails: `${type.charAt(0).toUpperCase()+type.slice(1)} Impairment` })
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message })
  }
}

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(400).json({ error: 'User already exists' })

    if (role === 'parent') {
      const { linkedStudentUDID } = req.body
      if (!linkedStudentUDID) return res.status(400).json({ error: "Child's UDID is required for parent registration" })
      const studentUDID = linkedStudentUDID.toUpperCase().trim()
      const student = await User.findOne({ udid: studentUDID, role: 'student' })
      if (!student) return res.status(400).json({ error: `No student found with UDID "${studentUDID}". Student must register first.` })
      req.body.linkedStudentUDID = studentUDID
    }

    const user = await User.create({ ...req.body, email: email.toLowerCase() })
    res.status(201).json({ success: true, token: generateToken(user._id), user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ success: true, token: generateToken(user._id), user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getMe = async (req, res) => {
  res.json({ success: true, user: formatUser(req.user) })
}

module.exports = { registerUser, loginUser, verifyUDID, getMe }