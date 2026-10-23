import { Request, Response } from 'express';
import { prisma } from '../lib/db';

export const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      include: {
        departments: {
          where: { isActive: true },
        },
      },
    });
    res.status(200).json({ status: 'success', data: { branches } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, code, address, city, phone, email, openingTime, closingTime } = req.body;

    const branch = await prisma.branch.create({
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
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const branch = await prisma.branch.findUnique({
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
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
