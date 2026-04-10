const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const formatUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  udid: user.udid,
  disabilityType: user.disabilityType,
  disabilityDetails: user.disabilityDetails,
  educationLevel: user.educationLevel,
  className: user.className,
  subject: user.subject,
  course: user.course,
  state: user.state,
  district: user.district,
  linkedStudentUDID: user.linkedStudentUDID,
  createdAt: user.createdAt,
});

// ── Verify UDID (Updated for Frontend Compatibility) ──────
const verifyUDID = async (req, res) => {
  try {
    const { udid } = req.params;
    const udidUpper = udid.toUpperCase();

    // Check if UDID is already registered to someone else
    const existing = await User.findOne({ udid: udidUpper });
    if (existing) {
      return res.status(400).json({ valid: false, error: 'UDID already registered' });
    }

    // Define allowed prefixes
    const prefixes = { VIS: 'visual', HEA: 'hearing', COG: 'cognitive' };
    const prefix = udidUpper.slice(0, 3);
    const type = prefixes[prefix];

    if (!type) {
      return res.status(400).json({ valid: false, error: 'Invalid UDID Prefix' });
    }

    // Success response matches frontend expectation of "res.data.valid"
    res.json({
      success: true,
      valid: true, 
      disabilityType: type,
      disabilityDetails: `${type.charAt(0).toUpperCase() + type.slice(1)} Impairment`,
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
};

// ── Register ──────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Missing required fields' });

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists)
      return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ ...req.body, email: email.toLowerCase() });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: formatUser(req.user) });
};

module.exports = { registerUser, loginUser, verifyUDID, getMe };