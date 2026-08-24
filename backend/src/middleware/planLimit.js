import UsageLog from '../models/UsageLog.js';
import { ApiError } from './errorHandler.js';

const FREE_DAILY_MESSAGE_LIMIT = 30;

export async function enforcePlanLimit(req, res, next) {
  if (req.user.plan === 'pro') return next();

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const count = await UsageLog.countDocuments({ user: req.user.id, createdAt: { $gte: since } });
  if (count >= FREE_DAILY_MESSAGE_LIMIT) {
    return next(new ApiError(429, `Free plan is limited to ${FREE_DAILY_MESSAGE_LIMIT} messages per day`));
  }
  next();
}
