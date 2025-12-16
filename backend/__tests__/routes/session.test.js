import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockSetLectureDates = jest.fn();
const mockGetLectureDates = jest.fn();
const mockUpdateLectureDate = jest.fn();
const mockDeleteLectureDate = jest.fn();
const mockSetDiscussionDates = jest.fn();
const mockGetDiscussionDates = jest.fn();
const mockUpdateDiscussionDate = jest.fn();
const mockDeleteDiscussionDate = jest.fn();
const mockToggleLectureAttendance = jest.fn();
const mockToggleDiscussionAttendance = jest.fn();

jest.unstable_mockModule('../../controllers/SessionController.js', () => ({
  setLectureDates: mockSetLectureDates,
  getLectureDates: mockGetLectureDates,
  updateLectureDate: mockUpdateLectureDate,
  deleteLectureDate: mockDeleteLectureDate,
  setDiscussionDates: mockSetDiscussionDates,
  getDiscussionDates: mockGetDiscussionDates,
  updateDiscussionDate: mockUpdateDiscussionDate,
  deleteDiscussionDate: mockDeleteDiscussionDate,
  toggleLectureAttendance: mockToggleLectureAttendance,
  toggleDiscussionAttendance: mockToggleDiscussionAttendance
}));

const sessionRoutes = (await import('../../routes/sessions.js')).default;

describe('Session Routes', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/sessions/lecture-dates', () => {
    it('returns 200 on success', async () => {
      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });
      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send({ semester: '1131', dates: ['2024-10-15'] });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockSetLectureDates.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .post('/api/sessions/lecture-dates')
        .send({ semester: '1131', dates: ['2024-10-15'] });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('GET /api/sessions/lecture-dates/:semester', () => {
    it('returns 200 on success', async () => {
      mockGetLectureDates.mockImplementation((req, res) => {
        res.status(200).json({ dates: ['2024-10-15'] });
      });
      const response = await request(app)
        .get('/api/sessions/lecture-dates/1131');
      expect(response.status).toBe(200);
      expect(response.body.dates).toEqual(['2024-10-15']);
    });

    it('returns 500 on server error', async () => {
      mockGetLectureDates.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .get('/api/sessions/lecture-dates/1131');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('PUT /api/sessions/lecture-dates/:semester/:oldDate', () => {
    it('returns 200 on success', async () => {
      mockUpdateLectureDate.mockImplementation((req, res) => {
        res.status(200).json({ updated: true });
      });
      const response = await request(app)
        .put('/api/sessions/lecture-dates/1131/2024-10-15')
        .send({ newDate: '2024-10-22' });
      expect(response.status).toBe(200);
      expect(response.body.updated).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockUpdateLectureDate.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .put('/api/sessions/lecture-dates/1131/2024-10-15')
        .send({ newDate: '2024-10-22' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('DELETE /api/sessions/lecture-dates/:semester/:actualDate', () => {
    it('returns 200 on success', async () => {
      mockDeleteLectureDate.mockImplementation((req, res) => {
        res.status(200).json({ deleted: true });
      });
      const response = await request(app)
        .delete('/api/sessions/lecture-dates/1131/2024-10-15');
      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockDeleteLectureDate.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .delete('/api/sessions/lecture-dates/1131/2024-10-15');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('POST /api/sessions/discussion-dates', () => {
    it('returns 200 on success', async () => {
      mockSetDiscussionDates.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });
      const response = await request(app)
        .post('/api/sessions/discussion-dates')
        .send({ semester: '1131', dates: ['2024-10-15'] });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockSetDiscussionDates.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .post('/api/sessions/discussion-dates')
        .send({ semester: '1131', dates: ['2024-10-15'] });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('GET /api/sessions/discussion-dates/:semester', () => {
    it('returns 200 on success', async () => {
      mockGetDiscussionDates.mockImplementation((req, res) => {
        res.status(200).json({ dates: ['2024-10-15'] });
      });
      const response = await request(app)
        .get('/api/sessions/discussion-dates/1131');
      expect(response.status).toBe(200);
      expect(response.body.dates).toEqual(['2024-10-15']);
    });

    it('returns 500 on server error', async () => {
      mockGetDiscussionDates.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .get('/api/sessions/discussion-dates/1131');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('PUT /api/sessions/discussion-dates/:semester/:oldDate', () => {
    it('returns 200 on success', async () => {
      mockUpdateDiscussionDate.mockImplementation((req, res) => {
        res.status(200).json({ updated: true });
      });
      const response = await request(app)
        .put('/api/sessions/discussion-dates/1131/2024-10-15')
        .send({ newDate: '2024-10-22' });
      expect(response.status).toBe(200);
      expect(response.body.updated).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockUpdateDiscussionDate.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .put('/api/sessions/discussion-dates/1131/2024-10-15')
        .send({ newDate: '2024-10-22' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('DELETE /api/sessions/discussion-dates/:semester/:actualDate', () => {
    it('returns 200 on success', async () => {
      mockDeleteDiscussionDate.mockImplementation((req, res) => {
        res.status(200).json({ deleted: true });
      });
      const response = await request(app)
        .delete('/api/sessions/discussion-dates/1131/2024-10-15');
      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockDeleteDiscussionDate.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .delete('/api/sessions/discussion-dates/1131/2024-10-15');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('PATCH /api/sessions/lecture-dates/:semester/:selectedDate/toggle', () => {
    it('returns 200 on success', async () => {
      mockToggleLectureAttendance.mockImplementation((req, res) => {
        res.status(200).json({ toggled: true });
      });
      const response = await request(app)
        .patch('/api/sessions/lecture-dates/1131/2024-10-15/toggle');
      expect(response.status).toBe(200);
      expect(response.body.toggled).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockToggleLectureAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .patch('/api/sessions/lecture-dates/1131/2024-10-15/toggle');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('PATCH /api/sessions/discussion-dates/:semester/:selectedDate/toggle', () => {
    it('returns 200 on success', async () => {
      mockToggleDiscussionAttendance.mockImplementation((req, res) => {
        res.status(200).json({ toggled: true });
      });
      const response = await request(app)
        .patch('/api/sessions/discussion-dates/1131/2024-10-15/toggle');
      expect(response.status).toBe(200);
      expect(response.body.toggled).toBe(true);
    });

    it('returns 500 on server error', async () => {
      mockToggleDiscussionAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .patch('/api/sessions/discussion-dates/1131/2024-10-15/toggle');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });
});
