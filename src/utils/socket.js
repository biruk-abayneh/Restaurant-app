// src/utils/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket || socket.disconnected) {
    socket = io('http://localhost:4000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Connected to KDS server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }
  return socket;
};
