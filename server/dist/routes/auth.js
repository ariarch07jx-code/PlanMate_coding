"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.authRouter = router;
function generateTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ error: '请填写所有必填字段' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: '密码长度不能少于6位' });
            return;
        }
        const existing = await db_1.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            res.status(409).json({ error: '用户名或邮箱已被注册' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: { username, email, password: hashedPassword },
        });
        const tokens = generateTokens(user.id);
        res.status(201).json({
            user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
            ...tokens,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: '服务器错误' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: '请输入邮箱和密码' });
            return;
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: '邮箱或密码错误' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: '邮箱或密码错误' });
            return;
        }
        const tokens = generateTokens(user.id);
        res.json({
            user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
            ...tokens,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: '服务器错误' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, username: true, email: true, avatar: true, bio: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ error: '用户不存在' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: '服务器错误' });
    }
});
// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: '缺少 refreshToken' });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await db_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(404).json({ error: '用户不存在' });
            return;
        }
        const tokens = generateTokens(user.id);
        res.json(tokens);
    }
    catch {
        res.status(401).json({ error: 'RefreshToken 无效或已过期' });
    }
});
//# sourceMappingURL=auth.js.map