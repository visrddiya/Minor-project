import express, { Express, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import branchRoutes from './routes/branch.routes';
import departmentRoutes from './routes/department.routes';
import counterRoutes from './routes/counter.routes';
import tokenRoutes from './routes/token.routes';
import appointmentRoutes from './routes/appointment.routes';
import { initSocket } from './lib/socket';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// HTTP & Socket Server creation
const server = http.createServer(app);
initSocket(server);

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Base Route & Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'QueueSphere Backend API Server is running.',
    healthCheck: '/api/v1/health',
    documentation: 'Access API routes via /api/v1/'
  });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'QueueSphere API Service is healthy and active.',
    timestamp: new Date().toISOString(),
    system: 'QueueSphere | Smart Queue Management System'
  });
});

// Mounting Module API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/counters', counterRoutes);
app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[QueueSphere Error]:', err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`⚡ [QueueSphere Server]: Listening on http://localhost:${PORT}`);
  });
}

export { server };
export default app;

