import mongoose from 'mongoose';

const presetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  systemPrompt: { type: String, required: true },
  temperature: { type: Number, default: 0.7, min: 0, max: 2 },
}, { timestamps: true });

export default mongoose.model('Preset', presetSchema);
