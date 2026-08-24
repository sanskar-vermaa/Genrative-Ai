import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json(conversations);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, presetId } = req.body;
  const conversation = await Conversation.create({
    user: req.user.id,
    title: title || 'New conversation',
    preset: presetId || null,
  });
  res.status(201).json(conversation);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const messages = await Message.find({ conversation: conversation.id }).sort({ createdAt: 1 });
  res.json({ ...conversation.toObject(), messages });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  conversation.title = req.body.title ?? conversation.title;
  await conversation.save();
  res.json(conversation);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  await Message.deleteMany({ conversation: conversation.id });
  res.status(204).send();
}));

export default router;
