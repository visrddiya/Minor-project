"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastAppointmentCreated = exports.broadcastCounterUpdated = exports.broadcastTokenUpdated = exports.broadcastTokenCalled = exports.broadcastTokenIssued = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (httpServer) => {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`🔌 [QueueSphere Socket]: Client connected (${socket.id})`);
        socket.on('join_branch', (branchId) => {
            socket.join(`branch_${branchId}`);
            console.log(`📌 [QueueSphere Socket]: ${socket.id} joined room branch_${branchId}`);
        });
        socket.on('leave_branch', (branchId) => {
            socket.leave(`branch_${branchId}`);
            console.log(`📌 [QueueSphere Socket]: ${socket.id} left room branch_${branchId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 [QueueSphere Socket]: Client disconnected (${socket.id})`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized!');
    }
    return io;
};
exports.getIO = getIO;
const broadcastTokenIssued = (token) => {
    if (io) {
        io.emit('token:issued', token);
        if (token.branchId) {
            io.to(`branch_${token.branchId}`).emit('token:issued', token);
        }
    }
};
exports.broadcastTokenIssued = broadcastTokenIssued;
const broadcastTokenCalled = (token) => {
    if (io) {
        io.emit('token:called', token);
        if (token.branchId) {
            io.to(`branch_${token.branchId}`).emit('token:called', token);
        }
    }
};
exports.broadcastTokenCalled = broadcastTokenCalled;
const broadcastTokenUpdated = (token) => {
    if (io) {
        io.emit('token:updated', token);
        if (token.branchId) {
            io.to(`branch_${token.branchId}`).emit('token:updated', token);
        }
    }
};
exports.broadcastTokenUpdated = broadcastTokenUpdated;
const broadcastCounterUpdated = (counter) => {
    if (io) {
        io.emit('counter:updated', counter);
        if (counter.branchId) {
            io.to(`branch_${counter.branchId}`).emit('counter:updated', counter);
        }
    }
};
exports.broadcastCounterUpdated = broadcastCounterUpdated;
const broadcastAppointmentCreated = (appointment) => {
    if (io) {
        io.emit('appointment:created', appointment);
        if (appointment.branchId) {
            io.to(`branch_${appointment.branchId}`).emit('appointment:created', appointment);
        }
    }
};
exports.broadcastAppointmentCreated = broadcastAppointmentCreated;
