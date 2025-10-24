import express from 'express';
import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

// GET all submissions
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Feedback".submission ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new submission
router.post('/', async (req, res) => {
  const { name, score } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "Feedback".submission (name, score) VALUES ($1, $2) RETURNING *',
      [name, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;