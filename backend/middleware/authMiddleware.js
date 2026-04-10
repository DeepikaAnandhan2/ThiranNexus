const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("Token received:", token); // DEBUG 1

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Payload:", decoded); // DEBUG 2

      req.user = await User.findById(decoded.id).select('-password');
      console.log("User found in DB:", req.user ? "YES" : "NO"); // DEBUG 3

      if (!req.user) return res.status(401).json({ error: 'User no longer exists' });
      return next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }
  if (!token) return res.status(401).json({ error: 'Not authorized, no token' });
};
module.exports = { protect };