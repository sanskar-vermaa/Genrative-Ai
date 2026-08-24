import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './db/connect.js';
import User from './models/User.js';
import Preset from './models/Preset.js';

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await User.findOneAndUpdate(
    { email: 'demo@genstudio.dev' },
    { name: 'Demo User', email: 'demo@genstudio.dev', passwordHash, plan: 'pro' },
    { upsert: true, new: true }
  );

  await Preset.findOneAndUpdate(
    { user: user.id, name: 'Concise assistant' },
    {
      user: user.id,
      name: 'Concise assistant',
      systemPrompt: 'You are a concise, helpful assistant. Answer in as few sentences as possible.',
      temperature: 0.4,
    },
    { upsert: true }
  );

  console.log('Seeded demo user: demo@genstudio.dev / demo1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
