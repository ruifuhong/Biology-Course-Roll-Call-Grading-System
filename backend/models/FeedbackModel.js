import { MongoClient } from 'mongodb';
import 'dotenv/config';

const dbName = 'bio-feedback';
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

export async function findLectureFeedbackBySemester(semester) {
  try {
    const database = await connectToMongoDB();
    const items = await database.collection('lecture-feedback')
      .find({ semester })
      .sort({ submitted_at: -1 })
      .toArray();
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
    console.error('Lecture FeedbackModel findBySemester error:', error);
    throw error;
  }
}

export async function findDiscussionFeedbackBySemester(semester) {
  try {
    const database = await connectToMongoDB();
    const items = await database.collection('discussion-feedback')
      .find({ semester })
      .sort({ submitted_at: -1 })
      .toArray();
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
    console.error('Discussion FeedbackModel findBySemester error:', error);
    throw error;
  }
}

export async function findAllLectureFeedback() {
  try {
    const database = await connectToMongoDB();
    const items = await database.collection('lecture-feedback').find().sort({ submitted_at: -1 }).toArray();

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
    console.error('Lecture FeedbackModel findAll error:', error);
    throw error;
  }
}

export async function findAllDiscussionFeedback() {
  try {
    const database = await connectToMongoDB();
    const items = await database.collection('discussion-feedback').find().sort({ submitted_at: -1 }).toArray();

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
    console.error('Discussion FeedbackModel findAll error:', error);
    throw error;
  }
}

export async function createLectureFeedback(feedbackData) {
  try {
    const { studentId, name, semester, actual_date, feedback } = feedbackData;
    if (!studentId || !name || !semester || !actual_date) {
      throw new Error('所有欄位皆須填寫 All fields are required: studentId, name, semester, actual_date');
    }

    const database = await connectToMongoDB();

    const existing = await database.collection('lecture-feedback').findOne({ studentId, semester, actual_date });
    if (existing) {
      throw new Error('回饋已提交 Feedback has already been submitted for this session');
    }

    const doc = {
      studentId,
      name,
      semester,
      actual_date,
      feedback,
      submitted_at: new Date()
    };
    const insertRes = await database.collection('lecture-feedback').insertOne(doc);
    const createdRaw = await database.collection('lecture-feedback').findOne({ _id: insertRes.insertedId });

    const created = {
      ...createdRaw,
      _id: createdRaw._id && createdRaw._id.toString ? createdRaw._id.toString() : createdRaw._id,
      submitted_at: createdRaw.submitted_at ? (createdRaw.submitted_at instanceof Date ? createdRaw.submitted_at.toISOString() : String(createdRaw.submitted_at)) : null
    };
    return created;
  } catch (error) {
    console.error('FeedbackModel createLectureFeedback error:', error);
    throw error;
  }
}

export async function createDiscussionFeedback(feedbackData) {
  try {
    const { studentId, name, semester, actual_date, feedback } = feedbackData;
    if (!studentId || !name || !semester || !actual_date) {
      throw new Error('所有欄位皆須填寫 All fields are required: studentId, name, semester, actual_date');
    }

    const database = await connectToMongoDB();

    const existing = await database.collection('discussion-feedback').findOne({ studentId, semester, actual_date });
    if (existing) {
      throw new Error('回饋已提交 Feedback has already been submitted for this session');
    }

    const doc = {
      studentId,
      name,
      semester,
      actual_date,
      feedback,
      submitted_at: new Date()
    };
    const insertRes = await database.collection('discussion-feedback').insertOne(doc);
    const createdRaw = await database.collection('discussion-feedback').findOne({ _id: insertRes.insertedId });

    const created = {
      ...createdRaw,
      _id: createdRaw._id && createdRaw._id.toString ? createdRaw._id.toString() : createdRaw._id,
      submitted_at: createdRaw.submitted_at ? (createdRaw.submitted_at instanceof Date ? createdRaw.submitted_at.toISOString() : String(createdRaw.submitted_at)) : null
    };
    return created;
  } catch (error) {
    console.error('FeedbackModel createDiscussionFeedback error:', error);
    throw error;
  }
}  