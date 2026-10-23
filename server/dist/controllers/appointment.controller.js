"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointments = exports.checkInAppointment = exports.bookAppointment = void 0;
const db_1 = require("../lib/db");
const bookAppointment = async (req, res) => {
    try {
        const { branchId, departmentId, customerName, phone, email, date, timeSlot } = req.body;
        const bookingRef = `QS-${Math.floor(10000 + Math.random() * 90000)}`;
        const appointment = await db_1.prisma.appointment.create({
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
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.bookAppointment = bookAppointment;
const checkInAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await db_1.prisma.appointment.findUnique({
            where: { id },
            include: { department: true },
        });
        if (!appointment) {
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        }
        // Issue Token
        const sequenceNumber = Math.floor(200 + Math.random() * 100);
        const tokenNumber = `${appointment.department.prefix}-${sequenceNumber}`;
        const token = await db_1.prisma.queueToken.create({
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
        await db_1.prisma.appointment.update({
            where: { id },
            data: { status: 'CHECKED_IN' },
        });
        res.status(200).json({ status: 'success', data: { appointment, token } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.checkInAppointment = checkInAppointment;
const getAppointments = async (req, res) => {
    try {
        const { branchId } = req.query;
        const appointments = await db_1.prisma.appointment.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: {
                department: true,
                branch: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ status: 'success', data: { appointments } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getAppointments = getAppointments;
