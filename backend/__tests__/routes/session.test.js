import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockSetLectureDates = jest.fn();
const mockGetLectureDates = jest.fn();
const mockUpdateLectureDate = jest.fn();
const mockDeleteLectureDate = jest.fn();

jest.unstable_mockModule('../../controllers/SessionController.js', () => ({
  setLectureDates: mockSetLectureDates,
  getLectureDates: mockGetLectureDates,
  updateLectureDate: mockUpdateLectureDate,
  deleteLectureDate: mockDeleteLectureDate
}));

const sessionRoutes = (await import('../../routes/sessions.js')).default;

describe('Session Routes - Add Session Date Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/sessions/lecture-dates', () => {
    it('should call controller with correct parameters for single date', async () => {
      const requestBody = {
        semester: '1131',
        dates: ['2024-10-15']
      };

      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(201).json([
          { semester: '1131', actual_date: '2024-10-15', is_active: false }
        ]);
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(mockSetLectureDates).toHaveBeenCalledTimes(1);
      
      const [req, res] = mockSetLectureDates.mock.calls[0];
      expect(req.body).toEqual(requestBody);
      expect(typeof res.status).toBe('function');
      expect(typeof res.json).toBe('function');
    });

    it('should handle multiple dates in request', async () => {
      const requestBody = {
        semester: '1131',
        dates: ['2024-10-15', '2024-10-22', '2024-10-29']
      };

      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(201).json([
          { semester: '1131', actual_date: '2024-10-15', is_active: false },
          { semester: '1131', actual_date: '2024-10-22', is_active: false },
          { semester: '1131', actual_date: '2024-10-29', is_active: false }
        ]);
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(3);
      expect(mockSetLectureDates).toHaveBeenCalledTimes(1);
    });

    it('should pass through validation errors from controller', async () => {
      const requestBody = { semester: '1131' };

      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'semester and non-empty dates array are required'
        });
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('semester and non-empty dates array are required');
    });

    it('should pass through duplicate date errors from controller', async () => {
      const requestBody = {
        semester: '1131',
        dates: ['2024-10-15']
      };

      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(409).json({
          error: 'Date 2024-10-15 already exists for semester 1131'
        });
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send(requestBody);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });

    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should handle server errors from controller', async () => {
      const requestBody = {
        semester: '1131',
        dates: ['2024-10-15']
      };

      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(500).json({
          error: 'Failed to set lecture dates',
          details: 'Database connection failed'
        });
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to set lecture dates');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send({ semester: '1131', dates: ['2024-10-15'] });
      expect(mockSetLectureDates).toHaveBeenCalled();
    });
  });

  describe('Route Parameter Validation', () => {
    it('should handle requests with extra body parameters', async () => {
      const requestBody = {
        semester: '1131',
        dates: ['2024-10-15'],
        extraField: 'should be ignored'
      };

      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(201).json([
          { semester: '1131', actual_date: '2024-10-15', is_active: false }
        ]);
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send(requestBody);

      expect(response.status).toBe(201);
      const [req] = mockSetLectureDates.mock.calls[0];
      expect(req.body.extraField).toBe('should be ignored');
    });

    it('should handle empty request body', async () => {
      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'semester and non-empty dates array are required'
        });
      });

      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
