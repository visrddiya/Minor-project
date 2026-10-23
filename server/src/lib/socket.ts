import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [QueueSphere Socket]: Client connected (${socket.id})`);

    socket.on('join_branch', (branchId: string) => {
      socket.join(`branch_${branchId}`);
      console.log(`📌 [QueueSphere Socket]: ${socket.id} joined room branch_${branchId}`);
    });

    socket.on('leave_branch', (branchId: string) => {
      socket.leave(`branch_${branchId}`);
      console.log(`📌 [QueueSphere Socket]: ${socket.id} left room branch_${branchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [QueueSphere Socket]: Client disconnected (${socket.id})`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

export const broadcastTokenIssued = (token: any) => {
  if (io) {
    io.emit('token:issued', token);
    if (token.branchId) {
      io.to(`branch_${token.branchId}`).emit('token:issued', token);
    }
  }
};

export const broadcastTokenCalled = (token: any) => {
  if (io) {
    io.emit('token:called', token);
    if (token.branchId) {
      io.to(`branch_${token.branchId}`).emit('token:called', token);
    }
  }
};

export const broadcastTokenUpdated = (token: any) => {
  if (io) {
    io.emit('token:updated', token);
    if (token.branchId) {
      io.to(`branch_${token.branchId}`).emit('token:updated', token);
    }
  }
};

export const broadcastCounterUpdated = (counter: any) => {
  if (io) {
    io.emit('counter:updated', counter);
    if (counter.branchId) {
      io.to(`branch_${counter.branchId}`).emit('counter:updated', counter);
    }
  }
};

export const broadcastAppointmentCreated = (appointment: any) => {
  if (io) {
    io.emit('appointment:created', appointment);
    if (appointment.branchId) {
      io.to(`branch_${appointment.branchId}`).emit('appointment:created', appointment);
    }
  }
};
