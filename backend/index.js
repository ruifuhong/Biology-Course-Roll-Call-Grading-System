import express from 'express';
import cors from 'cors';
import itemsRouter from './routes/items.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/items', itemsRouter);

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


