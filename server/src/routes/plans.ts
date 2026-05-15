import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = Router();

// === Daily Plans ===

// GET /api/plans/daily?date=2024-01-01
router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const plans = await prisma.dailyPlan.findMany({
      where: { userId: req.userId, date: { gte: date, lt: nextDay } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(plans);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/plans/daily
router.post('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, date } = req.body;
    const planDate = new Date(date || new Date());
    planDate.setHours(0, 0, 0, 0);

    const maxOrder = await prisma.dailyPlan.findFirst({
      where: { userId: req.userId, date: planDate },
      orderBy: { sortOrder: 'desc' },
    });

    const plan = await prisma.dailyPlan.create({
      data: {
        userId: req.userId!,
        title,
        date: planDate,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });
    res.status(201).json(plan);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/plans/daily/:id
router.put('/daily/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, completed } = req.body;
    const plan = await prisma.dailyPlan.update({
      where: { id: req.params.id as string, userId: req.userId },
      data: { title, completed },
    });
    res.json(plan);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/plans/daily/:id
router.delete('/daily/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.dailyPlan.delete({ where: { id: req.params.id as string, userId: req.userId } });
    res.json({ message: '已删除' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/plans/daily/reorder
router.put('/daily/reorder', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body; // ordered array of plan ids
    await Promise.all(
      ids.map((id: string, index: number) =>
        prisma.dailyPlan.updateMany({
          where: { id, userId: req.userId },
          data: { sortOrder: index },
        })
      )
    );
    res.json({ message: '排序已更新' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// === Monthly Plans ===

// GET /api/plans/monthly?year=2024&month=1
router.get('/monthly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);

    const plans = await prisma.monthlyPlan.findMany({
      where: { userId: req.userId, year, month },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(plans);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/plans/monthly
router.post('/monthly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, month, year } = req.body;

    const maxOrder = await prisma.monthlyPlan.findFirst({
      where: { userId: req.userId, month, year },
      orderBy: { sortOrder: 'desc' },
    });

    const plan = await prisma.monthlyPlan.create({
      data: {
        userId: req.userId!,
        title,
        month,
        year,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });
    res.status(201).json(plan);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/plans/monthly/:id
router.put('/monthly/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, completed } = req.body;
    const plan = await prisma.monthlyPlan.update({
      where: { id: req.params.id as string, userId: req.userId },
      data: { title, completed },
    });
    res.json(plan);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/plans/monthly/:id
router.delete('/monthly/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.monthlyPlan.delete({ where: { id: req.params.id as string, userId: req.userId } });
    res.json({ message: '已删除' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// === Phase Plans ===

// GET /api/plans/phase
router.get('/phase', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.phasePlan.findMany({
      where: { userId: req.userId },
      include: { tasks: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(plans);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/plans/phase
router.post('/phase', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const plan = await prisma.phasePlan.create({
      data: {
        userId: req.userId!,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: { tasks: true },
    });
    res.status(201).json(plan);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/plans/phase/:id
router.put('/phase/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, progress } = req.body;
    const plan = await prisma.phasePlan.update({
      where: { id: req.params.id as string, userId: req.userId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(progress !== undefined && { progress }),
      },
    });
    res.json(plan);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/plans/phase/:id
router.delete('/phase/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.phasePlan.delete({ where: { id: req.params.id as string, userId: req.userId } });
    res.json({ message: '已删除' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/plans/phase/:id/tasks
router.post('/phase/:id/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const maxOrder = await prisma.phaseTask.findFirst({
      where: { phaseId: req.params.id as string },
      orderBy: { sortOrder: 'desc' },
    });

    const task = await prisma.phaseTask.create({
      data: {
        phaseId: req.params.id as string,
        title,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    // Recalculate progress
    const tasks = await prisma.phaseTask.findMany({ where: { phaseId: req.params.id as string } });
    const progress = tasks.length > 0
      ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      : 0;
    await prisma.phasePlan.update({ where: { id: req.params.id as string }, data: { progress } });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/plans/phase/:id/tasks/:taskId
router.put('/phase/:id/tasks/:taskId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, completed } = req.body;
    await prisma.phaseTask.update({
      where: { id: req.params.taskId as string },
      data: { title, completed },
    });

    const tasks = await prisma.phaseTask.findMany({ where: { phaseId: req.params.id as string } });
    const progress = tasks.length > 0
      ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      : 0;
    await prisma.phasePlan.update({ where: { id: req.params.id as string }, data: { progress } });

    res.json({ message: '已更新' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/plans/phase/:id/tasks/:taskId
router.delete('/phase/:id/tasks/:taskId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.phaseTask.delete({ where: { id: req.params.taskId as string } });

    const tasks = await prisma.phaseTask.findMany({ where: { phaseId: req.params.id as string } });
    const progress = tasks.length > 0
      ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      : 0;
    await prisma.phasePlan.update({ where: { id: req.params.id as string }, data: { progress } });

    res.json({ message: '已删除' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as plansRouter };
