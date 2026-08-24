import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'));
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, plan: user.plan },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}
