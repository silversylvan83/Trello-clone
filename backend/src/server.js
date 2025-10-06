import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',') }
  });

  io.on('connection', (socket) => {
    // client will join board rooms for realtime updates
    socket.on('join-board', (boardId) => socket.join(String(boardId)));
  });

  // tiny broadcaster helper
  const boardEmit = (boardId, event, payload) => io.to(String(boardId)).emit(event, payload);
  // attach to global for routes import
  global.__boardEmit = boardEmit;

  server.listen(PORT, () => console.log(`🚀 API http://localhost:${PORT}`));
})();
