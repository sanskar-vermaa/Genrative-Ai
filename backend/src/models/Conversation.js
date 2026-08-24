import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New conversation' },
  preset: { type: mongoose.Schema.Types.ObjectId, ref: 'Preset', default: null },
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
