// backend/middleware/adminMiddleware.js
// Uses the separate Admin collection — NOT the User collection

const jwt   = require('jsonwebtoken')
const Admin = require('../models/Admin')

const adminProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No admin token provided' })

  try {
    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Must have isAdmin flag (set by adminAuthController.adminLogin)
    if (!decoded.isAdmin)
      return res.status(403).json({ error: 'Not an admin token' })

    const admin = await Admin.findById(decoded.id).select('-password')
    if (!admin) return res.status(401).json({ error: 'Admin not found' })
    if (admin.status === 'Inactive')
      return res.status(403).json({ error: 'Admin account is inactive' })

    req.user = admin   // req.user is the Admin document inside admin routes
    next()
  } catch {
    return res.status(401).json({ error: 'Admin token invalid or expired' })
  }
}

module.exports = { adminProtect }