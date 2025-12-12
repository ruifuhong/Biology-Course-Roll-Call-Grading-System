import * as FeedbackModel from '../models/FeedbackModel.js';

export async function getAllLectureFeedback(req, res) {
  try {
    const feedbackItems = await FeedbackModel.findAllLectureFeedback();
    res.json(feedbackItems);
  } catch (error) {
    console.error('FeedbackController getAllFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createLectureFeedback(req, res) {
  try {
    const { studentId, name, semester, actual_date, feedback } = req.body;
    console.log('Creating feedback:', { studentId, name, semester, actual_date, feedback });

    if (!studentId || !name || !semester || !actual_date) {
      return res.status(400).json({ error: 'All fields are required: studentId, name, semester, actual_date' });
    }
    if (typeof studentId !== 'string' || studentId.trim().length === 0) {
      return res.status(400).json({ error: 'studentId must be a non-empty string' });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
    if (typeof semester !== 'string' || semester.trim().length === 0) {
      return res.status(400).json({ error: 'semester must be a non-empty string' });
    }
    if (typeof actual_date !== 'string' || actual_date.trim().length === 0) {
      return res.status(400).json({ error: 'actual_date must be a non-empty string' });
    }

    const newFeedback = await FeedbackModel.createLectureFeedback({
      studentId: studentId.trim(),
      name: name.trim(),
      semester: semester.trim(),
      actual_date: actual_date.trim(),
      feedback: feedback.trim()
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('FeedbackController createFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getAllDiscussionFeedback(req, res) {
  try {
    const feedbackItems = await FeedbackModel.findAllDiscussionFeedback();
    res.json(feedbackItems);
  } catch (error) {
    console.error('FeedbackController getAllDiscussionFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createDiscussionFeedback(req, res) {
  try {
    const { studentId, name, semester, actual_date, feedback } = req.body;
    console.log('Creating discussion feedback:', { studentId, name, semester, actual_date, feedback });

    if (!studentId || !name || !semester || !actual_date) {
      return res.status(400).json({ error: 'All fields are required: studentId, name, semester, actual_date' });
    }
    if (typeof studentId !== 'string' || studentId.trim().length === 0) {
      return res.status(400).json({ error: 'studentId must be a non-empty string' });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
    if (typeof semester !== 'string' || semester.trim().length === 0) {
      return res.status(400).json({ error: 'semester must be a non-empty string' });
    }
    if (typeof actual_date !== 'string' || actual_date.trim().length === 0) {
      return res.status(400).json({ error: 'actual_date must be a non-empty string' });
    }

    const newFeedback = await FeedbackModel.createDiscussionFeedback({
      studentId: studentId.trim(),
      name: name.trim(),
      semester: semester.trim(),
      actual_date: actual_date.trim(),
      feedback: feedback.trim()
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('FeedbackController createDiscussionFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
}