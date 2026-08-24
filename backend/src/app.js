import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import presetRoutes from './routes/presets.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import usageRoutes from './routes/usage.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/presets', presetRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/usage', usageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
