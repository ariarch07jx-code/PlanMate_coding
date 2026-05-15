import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = Router();

// GET /api/pomodoro/stats
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await prisma.pomodoroSession.findMany({
      where: { userId: req.userId, createdAt: { gte: today }, completed: true },
    });

    const todayWorkCount = todaySessions.filter((s) => s.type === 'work').length;
    const todayWorkMinutes = todaySessions
      .filter((s) => s.type === 'work')
      .reduce((sum, s) => sum + s.duration, 0);

    const allSessions = await prisma.pomodoroSession.findMany({
      where: { userId: req.userId, completed: true },
    });
    const totalWorkCount = allSessions.filter((s) => s.type === 'work').length;

    res.json({ todayWorkCount, todayWorkMinutes, totalWorkCount });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/pomodoro/sessions
router.post('/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { duration, type, task, completed } = req.body;
    const session = await prisma.pomodoroSession.create({
      data: {
        userId: req.userId!,
        duration,
        type,
        task,
        completed: completed || false,
      },
    });
    res.status(201).json(session);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as pomodoroRouter };
