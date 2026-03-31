const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ── Token Helper ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ── Verify UDID ──
const verifyUDID = async (req, res) => {
  try {
    const { udid } = req.params;
    const existing = await User.findOne({ udid });
    if (existing) return res.status(400).json({ error: 'UDID already registered' });

    // Simple prefix logic for demo
    const prefixes = { 'VIS': 'visual', 'HEA': 'hearing', 'COG': 'cognitive' };
    const type = prefixes[udid.toUpperCase().slice(0, 3)] || 'other';

    res.json({ 
      success: true, 
      disabilityType: type, 
      disabilityDetails: `${type.charAt(0).toUpperCase() + type.slice(1)} Impairment` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Register User ──
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    // Save to DB (This triggers the pre-save hook in User.js)
    const user = await User.create({
      ...req.body,
      email: email.toLowerCase()
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── Login User ──
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, name: user.name }
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// CRITICAL: Export as an object to match the router's destructuring
module.exports = { registerUser, loginUser, verifyUDID, getMe };