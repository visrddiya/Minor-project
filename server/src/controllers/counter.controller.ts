import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { broadcastCounterUpdated } from '../lib/socket';

export const getCounters = async (req: Request, res: Response) => {
  try {
    const { branchId, departmentId } = req.query;

    const where = {
      ...(branchId ? { branchId: String(branchId) } : {}),
      ...(departmentId ? { departmentId: String(departmentId) } : {}),
    };

    const counters = await prisma.serviceCounter.findMany({
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
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateCounterStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;

    const counter = await prisma.serviceCounter.update({
      where: { id },
      data: { isOnline: Boolean(isOnline) },
    });

    broadcastCounterUpdated(counter);

    res.status(200).json({ status: 'success', data: { counter } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

