import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockSubmitLectureAttendance = jest.fn();
const mockSubmitDiscussionAttendance = jest.fn();
const mockGetStudentLectureAttendance = jest.fn();
const mockGetStudentDiscussionAttendance = jest.fn();
const mockGetAllLectureAttendance = jest.fn();
const mockGetAllDiscussionAttendance = jest.fn();

jest.unstable_mockModule('../../controllers/AttendanceController.js', () => ({
  submitLectureAttendance: mockSubmitLectureAttendance,
  submitDiscussionAttendance: mockSubmitDiscussionAttendance,
  getStudentLectureAttendance: mockGetStudentLectureAttendance,
  getStudentDiscussionAttendance: mockGetStudentDiscussionAttendance,
  getAllLectureAttendance: mockGetAllLectureAttendance,
  getAllDiscussionAttendance: mockGetAllDiscussionAttendance
}));

const attendanceRoutes = (await import('../../routes/attendance.js')).default;

describe('Attendance Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/attendance', attendanceRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/attendance/lecture', () => {
    it('returns 200 on success', async () => {
      mockSubmitLectureAttendance.mockImplementation((req, res) => {
        res.status(200).json({ message: 'ok' });
      });

      const response = await request(app)
        .post('/api/attendance/lecture')
        .send({ semester: '1131', studentId: 'B100000001', actual_date: '2024-10-15', status: 'present' });

      expect(response.status).toBe(200);
      expect(mockSubmitLectureAttendance).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockSubmitLectureAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/attendance/lecture')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /api/attendance/discussion', () => {
    it('returns 200 on success', async () => {
      mockSubmitDiscussionAttendance.mockImplementation((req, res) => {
        res.status(200).json({ message: 'ok' });
      });

      const response = await request(app)
        .post('/api/attendance/discussion')
        .send({ semester: '1131', studentId: 'B100000001', actual_date: '2024-10-16', status: 'present' });

      expect(response.status).toBe(200);
      expect(mockSubmitDiscussionAttendance).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockSubmitDiscussionAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/attendance/discussion')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('GET /api/attendance/lecture/:semester/:studentId', () => {
    it('returns 200 on success', async () => {
      mockGetStudentLectureAttendance.mockImplementation((req, res) => {
        res.status(200).json({ present: 10, absent: 2 });
      });

      const response = await request(app)
        .get('/api/attendance/lecture/1131/B100000001');

      expect(response.status).toBe(200);
      expect(response.body.present).toBe(10);
      expect(mockGetStudentLectureAttendance).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockGetStudentLectureAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .get('/api/attendance/lecture/1131/B100000001');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockGetStudentLectureAttendance).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/attendance/discussion/:semester/:studentId', () => {
    it('returns 200 on success', async () => {
      mockGetStudentDiscussionAttendance.mockImplementation((req, res) => {
        res.status(200).json({ present: 8, absent: 4 });
      });

      const response = await request(app)
        .get('/api/attendance/discussion/1131/B100000001');

      expect(response.status).toBe(200);
      expect(response.body.present).toBe(8);
      expect(mockGetStudentDiscussionAttendance).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockGetStudentDiscussionAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .get('/api/attendance/discussion/1131/B100000001');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockGetStudentDiscussionAttendance).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/attendance/lecture/:semester', () => {
    it('returns 200 on success', async () => {
      mockGetAllLectureAttendance.mockImplementation((req, res) => {
        res.status(200).json([{ studentId: 'B100000001', present: 10, absent: 2 }]);
      });

      const response = await request(app)
        .get('/api/attendance/lecture/1131');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockGetAllLectureAttendance).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockGetAllLectureAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .get('/api/attendance/lecture/1131');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockGetAllLectureAttendance).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/attendance/discussion/:semester', () => {
    it('returns 200 on success', async () => {
      mockGetAllDiscussionAttendance.mockImplementation((req, res) => {
        res.status(200).json([{ studentId: 'B100000001', present: 8, absent: 4 }]);
      });

      const response = await request(app)
        .get('/api/attendance/discussion/1131');
        
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockGetAllDiscussionAttendance).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on server error', async () => {
      mockGetAllDiscussionAttendance.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .get('/api/attendance/discussion/1131');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(mockGetAllDiscussionAttendance).toHaveBeenCalledTimes(1);
    });
  });
});
