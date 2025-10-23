import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const router = express.Router();

const dbName = 'test';

const mongoUrl = `mongodb://${encodeURIComponent(process.env.MONGO_INITDB_ROOT_USERNAME)}:${encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?authSource=admin`;

let db;

// Connect to MongoDB once and reuse connection
MongoClient.connect(mongoUrl)
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB:', mongoUrl);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// POST /nosql-items - add feedback
router.post('/', async (req, res) => {
  const { name, feedback } = req.body;
  console.log('POST /nosql-items body:', req.body);
  try {
    if (!db) return res.status(503).json({ error: 'MongoDB not connected' });
    const insertRes = await db.collection('items').insertOne({ name, feedback, submitted_at: new Date() });
    const createdRaw = await db.collection('items').findOne({ _id: insertRes.insertedId });

    // Normalize created document before sending back
    const created = {
      ...createdRaw,
      _id: createdRaw._id && createdRaw._id.toString ? createdRaw._id.toString() : createdRaw._id,
      submitted_at: createdRaw.submitted_at ? (createdRaw.submitted_at instanceof Date ? createdRaw.submitted_at.toISOString() : String(createdRaw.submitted_at)) : null
    };

    res.status(201).json(created);
  } catch (error) {
    console.log('Insert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /nosql-items - list feedbacks
router.get('/', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'MongoDB not connected' });
  try {
    const items = await db.collection('items').find().sort({ submitted_at: -1 }).toArray();

    // Normalize documents for JSON clients: make _id a string and submitted_at an ISO string
    const normalized = items.map(item => {
      // normalize _id (support ObjectId or extended JSON)
      const id = item._id && item._id.toString ? item._id.toString() : (item._id && item._id.$oid) ? item._id.$oid : item._id;

      // normalize submitted_at (support Date, extended JSON {$date:...}, or string)
      let submitted_at = null;
      if (item.submitted_at) {
        if (item.submitted_at.$date) {
          // mongo-express / some drivers return { $date: '...' }
          submitted_at = new Date(item.submitted_at.$date).toISOString();
        } else if (item.submitted_at instanceof Date) {
          submitted_at = item.submitted_at.toISOString();
        } else {
          // fallback to string conversion
          submitted_at = String(item.submitted_at);
        }
      }

      return {
        ...item,
        _id: id,
        submitted_at
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
