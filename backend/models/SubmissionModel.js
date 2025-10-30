import { pool } from './database.js';

export async function findAllSubmissions() {
  try {
    const result = await pool.query('SELECT * FROM "Feedback".submission ORDER BY submitted_at DESC');
    return result.rows;
  } catch (error) {
    console.error('SubmissionModel findAll error:', error);
    throw error;
  }
}

export async function createSubmission(submissionData) {
  try {
    const { name, score } = submissionData;
    
    if (!name || score === undefined || score === null) {
      throw new Error('Name and score are required');
    }
    
    const result = await pool.query(
      'INSERT INTO "Feedback".submission (name, score) VALUES ($1, $2) RETURNING *',
      [name, score]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('SubmissionModel create error:', error);
    throw error;
  }
}

