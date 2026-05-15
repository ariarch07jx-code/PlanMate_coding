"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countdownsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.countdownsRouter = router;
// GET /api/countdowns
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const countdowns = await db_1.prisma.countdown.findMany({
            where: { userId: req.userId },
            orderBy: { targetDate: 'asc' },
        });
        res.json(countdowns);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// POST /api/countdowns
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { title, targetDate, type, color } = req.body;
        const countdown = await db_1.prisma.countdown.create({
            data: {
                userId: req.userId,
                title,
                targetDate: new Date(targetDate),
                type: type || 'countdown',
                color,
            },
        });
        res.status(201).json(countdown);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// PUT /api/countdowns/:id
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { title, targetDate, type, color } = req.body;
        const countdown = await db_1.prisma.countdown.update({
            where: { id: req.params.id, userId: req.userId },
            data: {
                ...(title !== undefined && { title }),
                ...(targetDate && { targetDate: new Date(targetDate) }),
                ...(type !== undefined && { type }),
                ...(color !== undefined && { color }),
            },
        });
        res.json(countdown);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// DELETE /api/countdowns/:id
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        await db_1.prisma.countdown.delete({ where: { id: req.params.id, userId: req.userId } });
        res.json({ message: '已删除' });
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
//# sourceMappingURL=countdowns.js.map