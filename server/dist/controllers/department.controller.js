"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepartment = exports.getDepartments = void 0;
const db_1 = require("../lib/db");
const getDepartments = async (req, res) => {
    try {
        const { branchId } = req.query;
        const where = {
            isActive: true,
            ...(branchId ? { branchId: String(branchId) } : {}),
        };
        const departments = await db_1.prisma.department.findMany({
            where,
            include: {
                counters: true,
            },
        });
        res.status(200).json({ status: 'success', data: { departments } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res) => {
    try {
        const { name, code, prefix, description, branchId } = req.body;
        const department = await db_1.prisma.department.create({
            data: {
                name,
                code,
                prefix: prefix || 'A',
                description,
                branchId,
            },
        });
        res.status(201).json({ status: 'success', data: { department } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createDepartment = createDepartment;
