import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';
import { AuthRequest } from '../middlewares/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'queuesphere_enterprise_secret_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role, branchId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email address is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
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

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, branchId: user.branchId }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      status: 'success',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, branchId: user.branchId }, JWT_SECRET, {
      expiresIn: '24h',
    });

    const { password: _, ...userData } = user;

    res.status(200).json({
      status: 'success',
      data: { user: userData, token },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
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
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
