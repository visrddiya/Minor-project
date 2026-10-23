"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const branch_routes_1 = __importDefault(require("./routes/branch.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const counter_routes_1 = __importDefault(require("./routes/counter.routes"));
const token_routes_1 = __importDefault(require("./routes/token.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const socket_1 = require("./lib/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// HTTP & Socket Server creation
const server = http_1.default.createServer(app);
exports.server = server;
(0, socket_1.initSocket)(server);
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Base Route & Health Check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'QueueSphere Backend API Server is running.',
        healthCheck: '/api/v1/health',
        documentation: 'Access API routes via /api/v1/'
    });
});
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'QueueSphere API Service is healthy and active.',
        timestamp: new Date().toISOString(),
        system: 'QueueSphere | Smart Queue Management System'
    });
});
// Mounting Module API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/branches', branch_routes_1.default);
app.use('/api/v1/departments', department_routes_1.default);
app.use('/api/v1/counters', counter_routes_1.default);
app.use('/api/v1/tokens', token_routes_1.default);
app.use('/api/v1/appointments', appointment_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[QueueSphere Error]:', err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`⚡ [QueueSphere Server]: Listening on http://localhost:${PORT}`);
    });
}
exports.default = app;
