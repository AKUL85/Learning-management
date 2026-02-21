const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '7d7613a2d5ecdd564ad84896920c0a4555823253ecf0053b8a94945abc2fa320';
const JWT_EXPIRES_IN = '7d';


function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


function setTokenCookie(res, token) {jwt
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    sameSite: 'lax',
  });
}

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already in use' });

    const user = new User({ email, passwordHash: password });
    await user.save();

    const profile = new Profile({
      user: user._id,
      fullName,
      role,
      bankBalance: 1000.00,
    });
    await profile.save();

    const token = createToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({ user: { _id: user._id, email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user._id);
    setTokenCookie(res, token);

    res.json({ user: { _id: user._id, email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id email');
    if (!user) return res.json({ user: null });

    res.json({ user });
  } catch {
    res.json({ user: null });
  }
};
