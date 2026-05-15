"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.usersRouter = router;
// GET /api/users/search?q=
router.get('/search', auth_1.authMiddleware, async (req, res) => {
    try {
        const q = req.query.q || '';
        const users = await db_1.prisma.user.findMany({
            where: {
                username: { contains: q },
                id: { not: req.userId },
            },
            select: { id: true, username: true, avatar: true, bio: true },
            take: 20,
        });
        res.json(users);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// GET /api/users/:id
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.params.id },
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
        const isFriend = await db_1.prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId: req.userId, receiverId: user.id, status: 'accepted' },
                    { senderId: user.id, receiverId: req.userId, status: 'accepted' },
                ],
            },
        });
        res.json({ ...user, isFriend: !!isFriend });
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
// PUT /api/users/me
router.put('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const { username, bio, avatar } = req.body;
        const user = await db_1.prisma.user.update({
            where: { id: req.userId },
            data: { username, bio, avatar },
            select: { id: true, username: true, email: true, avatar: true, bio: true },
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: '服务器错误' });
    }
});
//# sourceMappingURL=users.js.map