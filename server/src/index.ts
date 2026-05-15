import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { friendsRouter } from './routes/friends';
import { plansRouter } from './routes/plans';
import { countdownsRouter } from './routes/countdowns';
import { pomodoroRouter } from './routes/pomodoro';
import { expensesRouter } from './routes/expenses';

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({ credentials: true, origin: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/countdowns', countdownsRouter);
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/expenses', expensesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static frontend in production
if (!isDev) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
