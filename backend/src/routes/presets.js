import { Router } from 'express';
import Preset from '../models/Preset.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const presets = await Preset.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(presets);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, systemPrompt, temperature } = req.body;
  if (!name || !systemPrompt) {
    throw new ApiError(400, 'name and systemPrompt are required');
  }

  const preset = await Preset.create({
    user: req.user.id,
    name,
    systemPrompt,
    temperature: temperature ?? 0.7,
  });
  res.status(201).json(preset);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const preset = await Preset.findOne({ _id: req.params.id, user: req.user.id });
  if (!preset) throw new ApiError(404, 'Preset not found');

  const { name, systemPrompt, temperature } = req.body;
  preset.name = name ?? preset.name;
  preset.systemPrompt = systemPrompt ?? preset.systemPrompt;
  preset.temperature = temperature ?? preset.temperature;
  await preset.save();

  res.json(preset);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const preset = await Preset.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!preset) throw new ApiError(404, 'Preset not found');
  res.status(204).send();
}));

export default router;
