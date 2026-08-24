import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Preset from '../models/Preset.js';
import UsageLog from '../models/UsageLog.js';
import { requireAuth } from '../middleware/auth.js';
import { enforcePlanLimit } from '../middleware/planLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';
import { generateReply } from '../services/gemini.js';

const router = Router();
router.use(requireAuth);

// Send a user message, get the assistant's reply from Gemini, and persist both.
router.post('/:conversationId', enforcePlanLimit, asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, 'content is required');
  }

  const conversation = await Conversation.findOne({ _id: req.params.conversationId, user: req.user.id });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const preset = conversation.preset ? await Preset.findById(conversation.preset) : null;

  const priorMessages = await Message.find({ conversation: conversation.id }).sort({ createdAt: 1 });
  const userMessage = await Message.create({
    conversation: conversation.id,
    role: 'user',
    content: content.trim(),
  });

  const history = [...priorMessages, userMessage].map((m) => ({ role: m.role, content: m.content }));

  const { text, promptTokens, completionTokens } = await generateReply({
    systemPrompt: preset?.systemPrompt,
    history,
    temperature: preset?.temperature,
  });

  const assistantMessage = await Message.create({
    conversation: conversation.id,
    role: 'assistant',
    content: text,
    tokenCount: completionTokens,
  });

  await UsageLog.create({
    user: req.user.id,
    conversation: conversation.id,
    promptTokens,
    completionTokens,
  });

  if (conversation.title === 'New conversation') {
    conversation.title = content.trim().slice(0, 60);
  }
  conversation.updatedAt = new Date();
  await conversation.save();

  res.status(201).json({ userMessage, assistantMessage });
}));

export default router;
