"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = exports.trackToken = exports.updateTokenStatus = exports.callNextToken = exports.issueKioskToken = void 0;
const db_1 = require("../lib/db");
const socket_1 = require("../lib/socket");
const issueKioskToken = async (req, res) => {
    try {
        const { branchId, departmentId, priority, customerName, customerPhone, customerEmail } = req.body;
        if (!branchId || !departmentId) {
            return res.status(400).json({ status: 'error', message: 'branchId and departmentId are required' });
        }
        const dept = await db_1.prisma.department.findUnique({ where: { id: departmentId } });
        if (!dept) {
            return res.status(404).json({ status: 'error', message: 'Department not found' });
        }
        const todayCount = await db_1.prisma.queueToken.count({
            where: {
                departmentId,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        const sequenceNumber = todayCount + 101;
        const tokenNumber = `${dept.prefix}-${sequenceNumber}`;
        const waitingBefore = await db_1.prisma.queueToken.count({
            where: { departmentId, status: 'WAITING' },
        });
        const estimatedWaitMinutes = Math.max(2, waitingBefore * 6);
        const token = await db_1.prisma.queueToken.create({
            data: {
                tokenNumber,
                sequenceNumber,
                priority: priority || 'NORMAL',
                customerName,
                customerPhone,
                customerEmail,
                branchId,
                departmentId,
                estimatedWaitMinutes,
                status: 'WAITING',
            },
            include: {
                department: true,
                branch: true,
            },
        });
        (0, socket_1.broadcastTokenIssued)(token);
        res.status(201).json({ status: 'success', data: { token } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.issueKioskToken = issueKioskToken;
const callNextToken = async (req, res) => {
    try {
        const { counterId } = req.body;
        if (!counterId) {
            return res.status(400).json({ status: 'error', message: 'counterId is required' });
        }
        const counter = await db_1.prisma.serviceCounter.findUnique({ where: { id: counterId } });
        if (!counter) {
            return res.status(404).json({ status: 'error', message: 'Counter not found' });
        }
        // Find next waiting token in FIFO order (arrival time)
        const waitingTokens = await db_1.prisma.queueToken.findMany({
            where: {
                departmentId: counter.departmentId,
                status: { in: ['WAITING', 'HELD'] },
            },
            orderBy: [
                { createdAt: 'asc' },
            ],
            take: 1,
        });
        if (waitingTokens.length === 0) {
            return res.status(200).json({ status: 'success', message: 'No waiting tokens in department', data: { token: null } });
        }
        const nextToken = waitingTokens[0];
        const updatedToken = await db_1.prisma.queueToken.update({
            where: { id: nextToken.id },
            data: {
                status: 'CALLING',
                counterId: counter.id,
                calledAt: new Date(),
            },
            include: {
                department: true,
                counter: true,
            },
        });
        (0, socket_1.broadcastTokenCalled)(updatedToken);
        res.status(200).json({ status: 'success', data: { token: updatedToken } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.callNextToken = callNextToken;
const updateTokenStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const data = { status: status };
        const now = new Date();
        if (status === 'SERVING')
            data.servedAt = now;
        if (status === 'COMPLETED')
            data.completedAt = now;
        if (status === 'CANCELLED')
            data.cancelledAt = now;
        const token = await db_1.prisma.queueToken.update({
            where: { id },
            data,
        });
        (0, socket_1.broadcastTokenUpdated)(token);
        res.status(200).json({ status: 'success', data: { token } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.updateTokenStatus = updateTokenStatus;
const trackToken = async (req, res) => {
    try {
        const { tokenNumber } = req.params;
        const token = await db_1.prisma.queueToken.findFirst({
            where: {
                tokenNumber: {
                    equals: tokenNumber,
                    mode: 'insensitive',
                },
            },
            include: {
                department: true,
                counter: true,
                branch: true,
            },
        });
        if (!token) {
            return res.status(404).json({ status: 'error', message: 'Token not found' });
        }
        const positionAhead = await db_1.prisma.queueToken.count({
            where: {
                departmentId: token.departmentId,
                status: 'WAITING',
                createdAt: { lt: token.createdAt },
            },
        });
        res.status(200).json({ status: 'success', data: { token, positionAhead } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.trackToken = trackToken;
const getTokens = async (req, res) => {
    try {
        const { branchId, departmentId, status } = req.query;
        const where = {};
        if (branchId)
            where.branchId = String(branchId);
        if (departmentId)
            where.departmentId = String(departmentId);
        if (status)
            where.status = status;
        const tokens = await db_1.prisma.queueToken.findMany({
            where,
            include: {
                department: true,
                counter: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.status(200).json({ status: 'success', data: { tokens } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getTokens = getTokens;
