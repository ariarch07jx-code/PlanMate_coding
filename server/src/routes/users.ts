import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = Router();

// GET /api/users/search?q=
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const users = await prisma.user.findMany({
      where: {
        username: { contains: q },
        id: { not: req.userId },
      },
      select: { id: true, username: true, avatar: true, bio: true },
      take: 20,
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/users/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true, username: true, avatar: true, bio: true, createdAt: true,
        dailyPlans: { where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }, orderBy: { sortOrder: 'asc' } },
        phasePlans: { orderBy: { createdAt: 'desc' }, include: { tasks: { orderBy: { sortOrder: 'asc' } } } },
        countdowns: { orderBy: { targetDate: 'asc' } },
      },
    });

    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    const isFriend = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId: user.id, status: 'accepted' },
          { senderId: user.id, receiverId: req.userId, status: 'accepted' },
        ],
      },
    });

    res.json({ ...user, isFriend: !!isFriend });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/users/me
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { username, bio, avatar },
      select: { id: true, username: true, email: true, avatar: true, bio: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as usersRouter };
