import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockGetAllLectureFeedback = jest.fn();
const mockCreateLectureFeedback = jest.fn();
const mockGetAllDiscussionFeedback = jest.fn();
const mockCreateDiscussionFeedback = jest.fn();

jest.unstable_mockModule('../../controllers/FeedbackController.js', () => ({
  getAllLectureFeedback: mockGetAllLectureFeedback,
  createLectureFeedback: mockCreateLectureFeedback,
  getAllDiscussionFeedback: mockGetAllDiscussionFeedback,
  createDiscussionFeedback: mockCreateDiscussionFeedback
}));

const feedbackRoutes = (await import('../../routes/feedback.js')).default;

describe('Feedback Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/feedback', feedbackRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/feedback', () => {
    it('returns 200 on success', async () => {
      mockGetAllLectureFeedback.mockImplementation((req, res) => {
        res.status(200).json([{ feedback: 'Great lecture!' }]);
      });

      const response = await request(app).get('/api/feedback');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockGetAllLectureFeedback).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockGetAllLectureFeedback.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app).get('/api/feedback');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockGetAllLectureFeedback).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/feedback', () => {
    it('returns 201 on success', async () => {
      mockCreateLectureFeedback.mockImplementation((req, res) => {
        res.status(201).json({ message: 'Created' });
      });

      const response = await request(app)
        .post('/api/feedback')
        .send({ studentId: 'B100000001', name: 'John', semester: '1131', actual_date: '2024-10-15', feedback: 'Nice!' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Created');
      expect(mockCreateLectureFeedback).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockCreateLectureFeedback.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/feedback')
        .send({ studentId: 'B100000001', name: 'John', semester: '1131', actual_date: '2024-10-15', feedback: 'Nice!' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockCreateLectureFeedback).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/feedback/discussion', () => {
    it('returns 200 on success', async () => {
      mockGetAllDiscussionFeedback.mockImplementation((req, res) => {
        res.status(200).json([{ feedback: 'Great discussion!' }]);
      });

      const response = await request(app).get('/api/feedback/discussion');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockGetAllDiscussionFeedback).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockGetAllDiscussionFeedback.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app).get('/api/feedback/discussion');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockGetAllDiscussionFeedback).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/feedback/discussion', () => {
    it('returns 201 on success', async () => {
      mockCreateDiscussionFeedback.mockImplementation((req, res) => {
        res.status(201).json({ message: 'Created' });
      });

      const response = await request(app)
        .post('/api/feedback/discussion')
        .send({ studentId: 'B100000001', name: 'John', semester: '1131', actual_date: '2024-10-16', feedback: 'Good!' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Created');
      expect(mockCreateDiscussionFeedback).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockCreateDiscussionFeedback.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/feedback/discussion')
        .send({ studentId: 'B100000001', name: 'John', semester: '1131', actual_date: '2024-10-16', feedback: 'Good!' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockCreateDiscussionFeedback).toHaveBeenCalledTimes(1);
    });
  });
});
