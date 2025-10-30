import * as SubmissionModel from '../models/SubmissionModel.js';

export async function getAllSubmissions(req, res) {
  try {
    const submissions = await SubmissionModel.findAllSubmissions();
    res.json(submissions);
  } catch (error) {
    console.error('SubmissionController getAllSubmissions error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createSubmission(req, res) {
  try {
    const { name, score } = req.body;
    
    if (!name || score === undefined || score === null) {
      return res.status(400).json({ error: 'Name and score are required' });
    }
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
    }
    
    const newSubmission = await SubmissionModel.createSubmission({ name, score });
    res.status(201).json(newSubmission);
  } catch (error) {
    console.error('SubmissionController createSubmission error:', error);
    res.status(500).json({ error: error.message });
  }
}