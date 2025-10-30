import { MongoClient } from 'mongodb';
import 'dotenv/config';

const dbName = 'test';
const mongoUrl = process.env.MONGO_URI || `mongodb://${encodeURIComponent(process.env.MONGO_INITDB_ROOT_USERNAME)}:${encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?authSource=admin`;

let db;

async function connectToMongoDB() {
  if (!db) {
    try {
      const client = await MongoClient.connect(mongoUrl);
      db = client.db(dbName);
      console.log('Connected to MongoDB:', mongoUrl);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  return db;
}

export async function findAllFeedback() {
  try {
    const database = await connectToMongoDB();
    const items = await database.collection('items').find().sort({ submitted_at: -1 }).toArray();

    return items.map(item => {
      const id = item._id && item._id.toString ? item._id.toString() : (item._id && item._id.$oid) ? item._id.$oid : item._id;

      let submitted_at = null;
      if (item.submitted_at) {
        if (item.submitted_at.$date) {
          submitted_at = new Date(item.submitted_at.$date).toISOString();
        } else if (item.submitted_at instanceof Date) {
          submitted_at = item.submitted_at.toISOString();
        } else {
          submitted_at = String(item.submitted_at);
        }
      }

      return {
        ...item,
        _id: id,
        submitted_at
      };
    });
  } catch (error) {
    console.error('FeedbackModel findAll error:', error);
    throw error;
  }
}

export async function createFeedback(feedbackData) {
  try {
    const { name, feedback } = feedbackData;
    
    if (!name || !feedback) {
      throw new Error('Name and feedback are required');
    }

    const database = await connectToMongoDB();
    const insertRes = await database.collection('items').insertOne({ 
      name, 
      feedback, 
      submitted_at: new Date() 
    });
    
    const createdRaw = await database.collection('items').findOne({ _id: insertRes.insertedId });

    const created = {
      ...createdRaw,
      _id: createdRaw._id && createdRaw._id.toString ? createdRaw._id.toString() : createdRaw._id,
      submitted_at: createdRaw.submitted_at ? (createdRaw.submitted_at instanceof Date ? createdRaw.submitted_at.toISOString() : String(createdRaw.submitted_at)) : null
    };

    return created;
  } catch (error) {
    console.error('FeedbackModel create error:', error);
    throw error;
  }
}