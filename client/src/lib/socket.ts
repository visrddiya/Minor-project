import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('⚡ [QueueSphere Client Socket]: Connected to server', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ [QueueSphere Client Socket]: Disconnected from server', reason);
});
