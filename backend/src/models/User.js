import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
