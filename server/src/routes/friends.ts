import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = Router();

// GET /api/friends
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const friendships = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: req.userId, status: 'accepted' },
          { receiverId: req.userId, status: 'accepted' },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true, bio: true } },
        receiver: { select: { id: true, username: true, avatar: true, bio: true } },
      },
    });

    const friends = friendships.map((f) =>
      f.senderId === req.userId ? f.receiver : f.sender
    );

    res.json(friends);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/friends/requests
router.get('/requests', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const incoming = await prisma.friendRequest.findMany({
      where: { receiverId: req.userId, status: 'pending' },
      include: { sender: { select: { id: true, username: true, avatar: true, bio: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const outgoing = await prisma.friendRequest.findMany({
      where: { senderId: req.userId, status: 'pending' },
      include: { receiver: { select: { id: true, username: true, avatar: true, bio: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ incoming, outgoing });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/friends/request
router.post('/request', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) {
      res.status(400).json({ error: '缺少 receiverId' });
      return;
    }

    if (receiverId === req.userId) {
      res.status(400).json({ error: '不能添加自己为好友' });
      return;
    }

    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId },
          { senderId: receiverId, receiverId: req.userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        res.status(400).json({ error: '已经是好友了' });
      } else {
        res.status(400).json({ error: '已有待处理的请求' });
      }
      return;
    }

    const request = await prisma.friendRequest.create({
      data: { senderId: req.userId!, receiverId },
      include: {
        receiver: { select: { id: true, username: true, avatar: true } },
      },
    });

    res.status(201).json(request);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/friends/request/:id
router.put('/request/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // accepted or rejected

    const request = await prisma.friendRequest.findFirst({
      where: { id: req.params.id as string, receiverId: req.userId, status: 'pending' },
    });

    if (!request) {
      res.status(404).json({ error: '请求不存在' });
      return;
    }

    if (status === 'rejected') {
      await prisma.friendRequest.delete({ where: { id: request.id } });
      res.json({ message: '已拒绝' });
      return;
    }

    const updated = await prisma.friendRequest.update({
      where: { id: request.id },
      data: { status: 'accepted' },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/friends/:userId
router.delete('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const friendship = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId as string, status: 'accepted' },
          { senderId: req.params.userId as string, receiverId: req.userId, status: 'accepted' },
        ],
      },
    });

    if (!friendship) {
      res.status(404).json({ error: '好友关系不存在' });
      return;
    }

    await prisma.friendRequest.delete({ where: { id: friendship.id } });
    res.json({ message: '已删除好友' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as friendsRouter };
