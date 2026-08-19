import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// POST /api/auth/signup
export const signup = async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({ email, password });

  // Sign a JWT containing the new user's id, so they're logged in immediately after signup.
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.status(201).json({ user, token });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Issue a JWT for this user so the client can authenticate future requests.
  // Payload just carries the user id; expiry comes from JWT_EXPIRES_IN (defaults to 7 days).
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.json({ user, token });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
