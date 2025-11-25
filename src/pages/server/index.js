// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Persistent in-memory store (replace with DB later)
let orders = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current orders to newly connected client
  socket.emit('orders-update', orders);

  // Listen for new orders from server tablet
  socket.on('new-order', (order) => {
    orders.push({ ...order, status: 'new' });
    console.log('New order received:', order.id);
    io.emit('orders-update', orders); // Broadcast to ALL KDS screens
  });

  // Listen for status updates from kitchen
  socket.on('update-status', ({ id, status }) => {
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    io.emit('orders-update', orders);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`KDS Server running on http://localhost:${PORT}`);
});