import * as FeedbackModel from '../models/FeedbackModel.js';

export async function getAllFeedback(req, res) {
  try {
    const feedbackItems = await FeedbackModel.findAllFeedback();
    res.json(feedbackItems);
  } catch (error) {
    console.error('FeedbackController getAllFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createFeedback(req, res) {
  try {
    const { name, feedback } = req.body;
    console.log('Creating feedback:', { name, feedback });
    
    if (!name || !feedback) {
      return res.status(400).json({ error: 'Name and feedback are required' });
    }
    
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }
    
    if (typeof feedback !== 'string' || feedback.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback must be a non-empty string' });
    }
    
    const newFeedback = await FeedbackModel.createFeedback({ 
      name: name.trim(), 
      feedback: feedback.trim() 
    });
    
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('FeedbackController createFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
}