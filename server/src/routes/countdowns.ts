import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = Router();

// GET /api/countdowns
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const countdowns = await prisma.countdown.findMany({
      where: { userId: req.userId },
      orderBy: { targetDate: 'asc' },
    });
    res.json(countdowns);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/countdowns
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, targetDate, type, color } = req.body;
    const countdown = await prisma.countdown.create({
      data: {
        userId: req.userId!,
        title,
        targetDate: new Date(targetDate),
        type: type || 'countdown',
        color,
      },
    });
    res.status(201).json(countdown);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/countdowns/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, targetDate, type, color } = req.body;
    const countdown = await prisma.countdown.update({
      where: { id: req.params.id as string, userId: req.userId },
      data: {
        ...(title !== undefined && { title }),
        ...(targetDate && { targetDate: new Date(targetDate) }),
        ...(type !== undefined && { type }),
        ...(color !== undefined && { color }),
      },
    });
    res.json(countdown);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/countdowns/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.countdown.delete({ where: { id: req.params.id as string, userId: req.userId } });
    res.json({ message: '已删除' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as countdownsRouter };
