import { jest } from '@jest/globals';

const mockFindAllLectureFeedback = jest.fn();
const mockCreateLectureFeedback = jest.fn();
const mockFindAllDiscussionFeedback = jest.fn();
const mockCreateDiscussionFeedback = jest.fn();

jest.unstable_mockModule('../../models/FeedbackModel.js', () => ({
  findAllLectureFeedback: mockFindAllLectureFeedback,
  createLectureFeedback: mockCreateLectureFeedback,
  findAllDiscussionFeedback: mockFindAllDiscussionFeedback,
  createDiscussionFeedback: mockCreateDiscussionFeedback,
}));

const FeedbackController = await import('../../controllers/FeedbackController.js');

describe('FeedbackController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLectureFeedback', () => {
    it('returns all feedbacks (200)', async () => {
      const req = {}, res = { json: jest.fn() };
      const fakeFeedbacks = [{ _id: '1' }, { _id: '2' }];

      mockFindAllLectureFeedback.mockResolvedValueOnce(fakeFeedbacks);

      await FeedbackController.getAllLectureFeedback(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeFeedbacks);
    });

    it('returns 500 on error', async () => {
      const req = {}, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockFindAllLectureFeedback.mockRejectedValueOnce(new Error('fail'));

      await FeedbackController.getAllLectureFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('createLectureFeedback', () => {
    const valid = { studentId: 'B100000001', name: 'John Doe', semester: '1131', actual_date: '2023-01-01', feedback: 'good' };

    it('returns 201 and created feedback', async () => {
      const req = { body: { ...valid } }, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const created = { ...valid, _id: 'id' };

      mockCreateLectureFeedback.mockResolvedValueOnce(created);

      await FeedbackController.createLectureFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it('returns 400 if required field missing', async () => {
      const req = { body: { ...valid } }, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      for (const field of ['studentId', 'name', 'semester', 'actual_date']) {
        const bad = { ...valid };
        delete bad[field];

        await FeedbackController.createLectureFeedback({ body: bad }, res);

        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it('returns 400 if required field is empty', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      for (const field of ['studentId', 'name', 'semester']) {
        const bad = { ...valid, [field]: '' };

        await FeedbackController.createLectureFeedback({ body: bad }, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it('returns 500 on model error', async () => {
      const req = { body: { ...valid } }, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockCreateLectureFeedback.mockRejectedValueOnce(new Error('fail'));

      await FeedbackController.createLectureFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('getAllDiscussionFeedback', () => {
    it('returns all feedbacks (200)', async () => {
      const req = {}, res = { json: jest.fn() };
      const fakeFeedbacks = [{ _id: '1' }, { _id: '2' }];

      mockFindAllDiscussionFeedback.mockResolvedValueOnce(fakeFeedbacks);

      await FeedbackController.getAllDiscussionFeedback(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeFeedbacks);
    });

    it('returns 500 on error', async () => {
      const req = {}, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockFindAllDiscussionFeedback.mockRejectedValueOnce(new Error('fail'));

      await FeedbackController.getAllDiscussionFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('createDiscussionFeedback', () => {
    const valid = { studentId: 'B100000001', name: 'John Doe', semester: '1131', actual_date: '2023-01-01', feedback: 'ok' };

    it('returns 201 and created feedback', async () => {
      const req = { body: { ...valid } }, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const created = { ...valid, _id: 'id' };

      mockCreateDiscussionFeedback.mockResolvedValueOnce(created);

      await FeedbackController.createDiscussionFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it('returns 400 if required field missing', async () => {
      const req = { body: { ...valid } }, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      for (const field of ['studentId', 'name', 'semester', 'actual_date']) {
        const bad = { ...valid };
        delete bad[field];

        await FeedbackController.createDiscussionFeedback({ body: bad }, res);

        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it('returns 400 if required field is empty', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      for (const field of ['studentId', 'name', 'semester']) {
        const bad = { ...valid, [field]: '' };

        await FeedbackController.createDiscussionFeedback({ body: bad }, res);

        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it('returns 500 on model error', async () => {
      const req = { body: { ...valid } }, res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockCreateDiscussionFeedback.mockRejectedValueOnce(new Error('fail'));

      await FeedbackController.createDiscussionFeedback(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});
