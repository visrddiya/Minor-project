"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCounterStatus = exports.getCounters = void 0;
const db_1 = require("../lib/db");
const socket_1 = require("../lib/socket");
const getCounters = async (req, res) => {
    try {
        const { branchId, departmentId } = req.query;
        const where = {
            ...(branchId ? { branchId: String(branchId) } : {}),
            ...(departmentId ? { departmentId: String(departmentId) } : {}),
        };
        const counters = await db_1.prisma.serviceCounter.findMany({
            where,
            include: {
                department: true,
                staffMembers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.status(200).json({ status: 'success', data: { counters } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getCounters = getCounters;
const updateCounterStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isOnline } = req.body;
        const counter = await db_1.prisma.serviceCounter.update({
            where: { id },
            data: { isOnline: Boolean(isOnline) },
        });
        (0, socket_1.broadcastCounterUpdated)(counter);
        res.status(200).json({ status: 'success', data: { counter } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.updateCounterStatus = updateCounterStatus;
