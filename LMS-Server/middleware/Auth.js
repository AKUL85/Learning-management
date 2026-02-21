const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '7d7613a2d5ecdd564ad84896920c0a4555823253ecf0053b8a94945abc2fa320';

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
