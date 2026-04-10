// backend/controllers/admin/adminAuthController.js
const jwt   = require('jsonwebtoken')
const Admin = require('../../models/Admin')

const generateToken = (id) =>
  jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/admin/auth/login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' })

    const admin = await Admin.findOne({ email })
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' })

    if (admin.status === 'Inactive')
      return res.status(403).json({ error: 'Account is inactive. Contact super admin.' })

    admin.lastLogin = new Date()
    await admin.save()

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: {
        id:    admin._id,
        name:  admin.name,
        email: admin.email,
        role:  admin.role,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/auth/me
exports.getAdminMe = async (req, res) => {
  res.json({ success: true, admin: req.user })
}

// POST /api/admin/auth/create  (super_admin only — seed first admin via script)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const exists = await Admin.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const admin = await Admin.create({ name, email, password, role: role || 'admin' })
    res.status(201).json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}