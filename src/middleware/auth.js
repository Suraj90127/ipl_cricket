import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function attachUser(req, _res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
  } catch (err) {
    // ignore
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

export async function loadUser(req, res, next) {

  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'User not found' });
  req.user = user;
  next();
}

export default requireAuth;
