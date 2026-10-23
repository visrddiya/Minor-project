import { Request, Response } from 'express';
import { prisma } from '../lib/db';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    const where = {
      isActive: true,
      ...(branchId ? { branchId: String(branchId) } : {}),
    };

    const departments = await prisma.department.findMany({
      where,
      include: {
        counters: true,
      },
    });

    res.status(200).json({ status: 'success', data: { departments } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code, prefix, description, branchId } = req.body;

    const department = await prisma.department.create({
      data: {
        name,
        code,
        prefix: prefix || 'A',
        description,
        branchId,
      },
    });

    res.status(201).json({ status: 'success', data: { department } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
