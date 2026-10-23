"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchById = exports.createBranch = exports.getBranches = void 0;
const db_1 = require("../lib/db");
const getBranches = async (req, res) => {
    try {
        const branches = await db_1.prisma.branch.findMany({
            where: { isActive: true },
            include: {
                departments: {
                    where: { isActive: true },
                },
            },
        });
        res.status(200).json({ status: 'success', data: { branches } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getBranches = getBranches;
const createBranch = async (req, res) => {
    try {
        const { name, code, address, city, phone, email, openingTime, closingTime } = req.body;
        const branch = await db_1.prisma.branch.create({
            data: {
                name,
                code,
                address,
                city,
                phone,
                email,
                openingTime: openingTime || '08:00',
                closingTime: closingTime || '17:00',
            },
        });
        res.status(201).json({ status: 'success', data: { branch } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createBranch = createBranch;
const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await db_1.prisma.branch.findUnique({
            where: { id },
            include: {
                departments: true,
                counters: true,
            },
        });
        if (!branch) {
            return res.status(404).json({ status: 'error', message: 'Branch not found' });
        }
        res.status(200).json({ status: 'success', data: { branch } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getBranchById = getBranchById;
