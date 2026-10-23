import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { PriorityLevel, TokenStatus } from '@prisma/client';
import { broadcastTokenIssued, broadcastTokenCalled, broadcastTokenUpdated } from '../lib/socket';

export const issueKioskToken = async (req: Request, res: Response) => {
  try {
    const { branchId, departmentId, priority, customerName, customerPhone, customerEmail } = req.body;

    if (!branchId || !departmentId) {
      return res.status(400).json({ status: 'error', message: 'branchId and departmentId are required' });
    }

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) {
      return res.status(404).json({ status: 'error', message: 'Department not found' });
    }

    const todayCount = await prisma.queueToken.count({
      where: {
        departmentId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const sequenceNumber = todayCount + 101;
    const tokenNumber = `${dept.prefix}-${sequenceNumber}`;

    const waitingBefore = await prisma.queueToken.count({
      where: { departmentId, status: 'WAITING' },
    });

    const estimatedWaitMinutes = Math.max(2, waitingBefore * 6);

    const token = await prisma.queueToken.create({
      data: {
        tokenNumber,
        sequenceNumber,
        priority: (priority as PriorityLevel) || 'NORMAL',
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

    broadcastTokenIssued(token);

    res.status(201).json({ status: 'success', data: { token } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const callNextToken = async (req: Request, res: Response) => {
  try {
    const { counterId } = req.body;

    if (!counterId) {
      return res.status(400).json({ status: 'error', message: 'counterId is required' });
    }

    const counter = await prisma.serviceCounter.findUnique({ where: { id: counterId } });
    if (!counter) {
      return res.status(404).json({ status: 'error', message: 'Counter not found' });
    }

    // Find next waiting token in FIFO order (arrival time)
    const waitingTokens = await prisma.queueToken.findMany({
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

    const updatedToken = await prisma.queueToken.update({
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

    broadcastTokenCalled(updatedToken);

    res.status(200).json({ status: 'success', data: { token: updatedToken } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateTokenStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const data: any = { status: status as TokenStatus };
    const now = new Date();

    if (status === 'SERVING') data.servedAt = now;
    if (status === 'COMPLETED') data.completedAt = now;
    if (status === 'CANCELLED') data.cancelledAt = now;

    const token = await prisma.queueToken.update({
      where: { id },
      data,
    });

    broadcastTokenUpdated(token);

    res.status(200).json({ status: 'success', data: { token } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const trackToken = async (req: Request, res: Response) => {
  try {
    const { tokenNumber } = req.params;

    const token = await prisma.queueToken.findFirst({
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

    const positionAhead = await prisma.queueToken.count({
      where: {
        departmentId: token.departmentId,
        status: 'WAITING',
        createdAt: { lt: token.createdAt },
      },
    });

    res.status(200).json({ status: 'success', data: { token, positionAhead } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getTokens = async (req: Request, res: Response) => {
  try {
    const { branchId, departmentId, status } = req.query;

    const where: any = {};
    if (branchId) where.branchId = String(branchId);
    if (departmentId) where.departmentId = String(departmentId);
    if (status) where.status = status as TokenStatus;

    const tokens = await prisma.queueToken.findMany({
      where,
      include: {
        department: true,
        counter: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.status(200).json({ status: 'success', data: { tokens } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
