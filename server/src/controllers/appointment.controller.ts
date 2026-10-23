import { Request, Response } from 'express';
import { prisma } from '../lib/db';

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { branchId, departmentId, customerName, phone, email, date, timeSlot } = req.body;

    const bookingRef = `QS-${Math.floor(10000 + Math.random() * 90000)}`;

    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        customerName,
        phone,
        email,
        branchId,
        departmentId,
        date: new Date(date),
        timeSlot,
        status: 'SCHEDULED',
      },
      include: {
        branch: true,
        department: true,
      },
    });

    res.status(201).json({ status: 'success', data: { appointment } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const checkInAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!appointment) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    // Issue Token
    const sequenceNumber = Math.floor(200 + Math.random() * 100);
    const tokenNumber = `${appointment.department.prefix}-${sequenceNumber}`;

    const token = await prisma.queueToken.create({
      data: {
        tokenNumber,
        sequenceNumber,
        priority: 'NORMAL',
        customerName: appointment.customerName,
        customerPhone: appointment.phone,
        customerEmail: appointment.email,
        branchId: appointment.branchId,
        departmentId: appointment.departmentId,
        estimatedWaitMinutes: 3,
        status: 'WAITING',
      },
      include: {
        department: true,
        branch: true,
      },
    });

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CHECKED_IN' },
    });

    res.status(200).json({ status: 'success', data: { appointment, token } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    const appointments = await prisma.appointment.findMany({
      where: branchId ? { branchId: String(branchId) } : {},
      include: {
        department: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ status: 'success', data: { appointments } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
