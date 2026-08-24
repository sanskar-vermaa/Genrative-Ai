import { Router } from 'express';
import mongoose from 'mongoose';
import UsageLog from '../models/UsageLog.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', asyncHandler(async (req, res) => {
  res.json(await buildSummary(req.user.id));
}));

async function buildSummary(userId) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const uid = new mongoose.Types.ObjectId(userId);

  const [todayAgg] = await UsageLog.aggregate([
    { $match: { user: uid, createdAt: { $gte: since } } },
    { $group: { _id: null, promptTokens: { $sum: '$promptTokens' }, completionTokens: { $sum: '$completionTokens' }, messages: { $sum: 1 } } },
  ]);

  const [totalAgg] = await UsageLog.aggregate([
    { $match: { user: uid } },
    { $group: { _id: null, promptTokens: { $sum: '$promptTokens' }, completionTokens: { $sum: '$completionTokens' }, messages: { $sum: 1 } } },
  ]);

  return {
    today: todayAgg || { promptTokens: 0, completionTokens: 0, messages: 0 },
    allTime: totalAgg || { promptTokens: 0, completionTokens: 0, messages: 0 },
  };
}

export default router;
