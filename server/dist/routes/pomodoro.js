"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pomodoroRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.pomodoroRouter = router;
// GET /api/pomodoro/stats
router.get('/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySessions = await db_1.prisma.pomodoroSession.findMany({
            where: { userId: req.userId, createdAt: { gte: today }, completed: true },
        });
        const todayWorkCount = todaySessions.filter((s) => s.type === 'work').length;
        const todayWorkMinutes = todaySessions
            .filter((s) => s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0);
        const allSessions = await db_1.prisma.pomodoroSession.findMany({
            where: { userId: req.userId, completed: true },
        });
        const totalWorkCount = allSessions.filter((s) => s.type === 'work').length;
        res.json({ todayWorkCount, todayWorkMinutes, totalWorkCount });
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// POST /api/pomodoro/sessions
router.post('/sessions', auth_1.authMiddleware, async (req, res) => {
    try {
        const { duration, type, task, completed } = req.body;
        const session = await db_1.prisma.pomodoroSession.create({
            data: {
                userId: req.userId,
                duration,
                type,
                task,
                completed: completed || false,
            },
        });
        res.status(201).json(session);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
//# sourceMappingURL=pomodoro.js.map