const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  // Guard against "undefined" or "null" strings from frontend bugs
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();

  } catch (error) {
    const message =
      error.name === 'TokenExpiredError' ? 'Token expired, please login again' :
      error.name === 'JsonWebTokenError'  ? 'Invalid token'                    :
                                            'Not authorized';

    return res.status(401).json({ error: message });
  }
};

module.exports = { protect };