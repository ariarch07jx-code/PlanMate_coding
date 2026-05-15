"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_1 = require("./routes/auth");
const users_1 = require("./routes/users");
const friends_1 = require("./routes/friends");
const plans_1 = require("./routes/plans");
const countdowns_1 = require("./routes/countdowns");
const pomodoro_1 = require("./routes/pomodoro");
const expenses_1 = require("./routes/expenses");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';
app.use((0, cors_1.default)({ credentials: true, origin: true }));
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// API routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/users', users_1.usersRouter);
app.use('/api/friends', friends_1.friendsRouter);
app.use('/api/plans', plans_1.plansRouter);
app.use('/api/countdowns', countdowns_1.countdownsRouter);
app.use('/api/pomodoro', pomodoro_1.pomodoroRouter);
app.use('/api/expenses', expenses_1.expensesRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Serve static frontend in production
if (!isDev) {
    const clientDist = path_1.default.join(__dirname, '../../client/dist');
    app.use(express_1.default.static(clientDist));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map