import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import quizRoutes from './routes/quiz';
import revisionRoutes from './routes/revision';
import subscriptionRoutes from './routes/subscription';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`AceIt server running on http://localhost:${PORT}`));
