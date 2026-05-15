import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
const router = Router();

// GET /api/expenses?month=1&year=2024
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId, date: { gte: startDate, lt: endDate } },
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/expenses/stats?month=1&year=2024
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId, date: { gte: startDate, lt: endDate } },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    res.json({ total, byCategory, count: expenses.length });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/expenses
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, note, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        userId: req.userId!,
        amount,
        category,
        note,
        date: new Date(date || new Date()),
      },
    });
    res.status(201).json(expense);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/expenses/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, note, date } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id as string, userId: req.userId },
      data: {
        ...(amount !== undefined && { amount }),
        ...(category !== undefined && { category }),
        ...(note !== undefined && { note }),
        ...(date && { date: new Date(date) }),
      },
    });
    res.json(expense);
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id as string, userId: req.userId } });
    res.json({ message: '已删除' });
  } catch {
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as expensesRouter };
