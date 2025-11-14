import express from 'express';
import cors from 'cors';
import itemsRouter from './routes/items.js';
import submissionRouter from './routes/submission.js';
import nosqlItemsRouter from './routes/nosql-items.js';
import studentsRouter from './routes/students.js';
import sessionsRouter from './routes/sessions.js';
import attendanceRouter from './routes/attendance.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/items', itemsRouter);
app.use('/submission', submissionRouter);
app.use('/nosql-items', nosqlItemsRouter);
app.use('/students', studentsRouter);
app.use('/sessions', sessionsRouter);
app.use('/attendance', attendanceRouter);

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

export default app;


