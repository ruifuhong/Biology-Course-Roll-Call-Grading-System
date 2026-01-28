
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import studentsRouter from './routes/students.js';
import sessionsRouter from './routes/sessions.js';
import attendanceRouter from './routes/attendance.js';
import feedbackRouter from './routes/feedback.js';
import adminRouter from './routes/admin.js';
import reviewRouter from './routes/review.js';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://biology-attendence-new-ui.onrender.com', 'https://biology-attendence-new-static-frontend.onrender.com'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/students', studentsRouter);
app.use('/sessions', sessionsRouter);
app.use('/attendance', attendanceRouter);
app.use('/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);
app.use('/review', reviewRouter);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://biology-attendence-new-ui.onrender.com', 'https://biology-attendence-new-static-frontend.onrender.com'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

export { app, io };


