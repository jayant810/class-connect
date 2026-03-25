import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/index.js';
import { initDb } from './db/init.js';
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Initialize DB
initDb();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(path.dirname(__dirname), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('ClassConnect API is running');
});

// Typing State Management
// Structure: { [channelId]: { [userId]: { userName: string, lastTimestamp: number } } }
const typingUsers: Record<string, Record<string, { userName: string, lastTimestamp: number }>> = {};

const broadcastTyping = (channelId: string) => {
  if (!typingUsers[channelId]) return;
  
  const users = Object.entries(typingUsers[channelId]).map(([id, data]) => ({
    id,
    userName: data.userName,
  }));
  
  io.to(channelId).emit('typing_users', users);
};

// Cleanup stale typing users every 5 seconds
setInterval(() => {
  const now = Date.now();
  let changed = false;
  
  for (const channelId in typingUsers) {
    for (const userId in typingUsers[channelId]) {
      if (now - typingUsers[channelId][userId].lastTimestamp > 10000) { // 10s auto-expiry
        delete typingUsers[channelId][userId];
        changed = true;
      }
    }
    if (changed) broadcastTyping(channelId);
  }
}, 5000);

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
    // Send current typing users to the joining user
    broadcastTyping(channelId);
  });

  socket.on('send_message', (data) => {
    // Save to DB logic is handled in controller, this is just broadcast
    io.to(data.channelId).emit('receive_message', data);
    
    // Stop typing when message is sent
    if (typingUsers[data.channelId]?.[data.senderId]) {
      delete typingUsers[data.channelId][data.senderId];
      broadcastTyping(data.channelId);
    }
  });

  socket.on('update_message', (data) => {
    io.to(data.channelId).emit('update_message', data);
  });

  socket.on('typing_start', (data: { channelId: string, userId: string, userName: string }) => {
    if (!typingUsers[data.channelId]) typingUsers[data.channelId] = {};
    
    typingUsers[data.channelId][data.userId] = {
      userName: data.userName,
      lastTimestamp: Date.now(),
    };
    broadcastTyping(data.channelId);
  });

  socket.on('typing_stop', (data: { channelId: string, userId: string }) => {
    if (typingUsers[data.channelId]?.[data.userId]) {
      delete typingUsers[data.channelId][data.userId];
      broadcastTyping(data.channelId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from all typing lists
    for (const channelId in typingUsers) {
      // Note: We'd need to map socket.id to userId if we wanted perfect cleanup here
      // For now, we rely on the 10s heartbeat cleanup or explicit typing_stop
    }
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
