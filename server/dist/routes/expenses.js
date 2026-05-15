"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.expensesRouter = router;
// GET /api/expenses?month=1&year=2024
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const expenses = await db_1.prisma.expense.findMany({
            where: { userId: req.userId, date: { gte: startDate, lt: endDate } },
            orderBy: { date: 'desc' },
        });
        res.json(expenses);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// GET /api/expenses/stats?month=1&year=2024
router.get('/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const expenses = await db_1.prisma.expense.findMany({
            where: { userId: req.userId, date: { gte: startDate, lt: endDate } },
        });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const byCategory = {};
        expenses.forEach((e) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });
        res.json({ total, byCategory, count: expenses.length });
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// POST /api/expenses
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { amount, category, note, date } = req.body;
        const expense = await db_1.prisma.expense.create({
            data: {
                userId: req.userId,
                amount,
                category,
                note,
                date: new Date(date || new Date()),
            },
        });
        res.status(201).json(expense);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// PUT /api/expenses/:id
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { amount, category, note, date } = req.body;
        const expense = await db_1.prisma.expense.update({
            where: { id: req.params.id, userId: req.userId },
            data: {
                ...(amount !== undefined && { amount }),
                ...(category !== undefined && { category }),
                ...(note !== undefined && { note }),
                ...(date && { date: new Date(date) }),
            },
        });
        res.json(expense);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// DELETE /api/expenses/:id
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        await db_1.prisma.expense.delete({ where: { id: req.params.id, userId: req.userId } });
        res.json({ message: '已删除' });
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
//# sourceMappingURL=expenses.js.map