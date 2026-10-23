"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
const JWT_SECRET = process.env.JWT_SECRET || 'queuesphere_enterprise_secret_key_2026';
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role, branchId } = req.body;
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ status: 'error', message: 'Email address is already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role || 'CUSTOMER',
                branchId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                branchId: true,
                createdAt: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, branchId: user.branchId }, JWT_SECRET, {
            expiresIn: '24h',
        });
        res.status(201).json({
            status: 'success',
            data: { user, token },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials or inactive account' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, branchId: user.branchId }, JWT_SECRET, {
            expiresIn: '24h',
        });
        const { password: _, ...userData } = user;
        res.status(200).json({
            status: 'success',
            data: { user: userData, token },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Login failed' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Not authenticated' });
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                branchId: true,
                createdAt: true,
            },
        });
        res.status(200).json({ status: 'success', data: { user } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getMe = getMe;
