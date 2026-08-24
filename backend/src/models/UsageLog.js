import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('UsageLog', usageLogSchema);
