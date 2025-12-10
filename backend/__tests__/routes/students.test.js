
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockCreateStudent = jest.fn();
const mockGetStudentsBySemester = jest.fn();
const mockGetStudentById = jest.fn();
const mockUpdateStudent = jest.fn();
const mockDeleteStudent = jest.fn();
const mockUploadStudentsCSV = jest.fn();

jest.unstable_mockModule('../../controllers/StudentController.js', () => ({
  createStudent: mockCreateStudent,
  getStudentsBySemester: mockGetStudentsBySemester,
  getStudentById: mockGetStudentById,
  updateStudent: mockUpdateStudent,
  deleteStudent: mockDeleteStudent,
  uploadStudentsCSV: mockUploadStudentsCSV
}));

const studentsRoutes = (await import('../../routes/students.js')).default;

describe('Students Routes', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/students', studentsRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/students/', () => {
    it('returns 200 on success', async () => {
      mockCreateStudent.mockImplementation((req, res) => {
        res.status(200).json({ student_id: 'B100000001', name: 'Alice' });
      });
      const response = await request(app)
        .post('/api/students/')
        .send({ student_id: 'B100000001', semester: '1131', department: 'Bio', group_name: 'A', name: 'Alice' });
      expect(response.status).toBe(200);
      expect(response.body.student_id).toBe('B100000001');
    });

    it('returns 500 on error', async () => {
      mockCreateStudent.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .post('/api/students/')
        .send({ student_id: 'B100000001', semester: '1131', department: 'Bio', group_name: 'A', name: 'Alice' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('GET /api/students/:semester', () => {
    it('returns 200 on success', async () => {
      mockGetStudentsBySemester.mockImplementation((req, res) => {
        res.status(200).json([{ student_id: 'B100000001', name: 'Alice' }]);
      });
      const response = await request(app)
        .get('/api/students/1131');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns 500 on error', async () => {
      mockGetStudentsBySemester.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .get('/api/students/1131');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('GET /api/students/:semester/:studentId', () => {
    it('returns 200 on success', async () => {
      mockGetStudentById.mockImplementation((req, res) => {
        res.status(200).json({ student_id: 'B100000001', name: 'Alice' });
      });
      const response = await request(app)
        .get('/api/students/1131/B100000001');
      expect(response.status).toBe(200);
      expect(response.body.student_id).toBe('B100000001');
    });

    it('returns 500 on error', async () => {
      mockGetStudentById.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .get('/api/students/1131/B100000001');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('PUT /api/students/:semester/:studentId', () => {
    it('returns 200 on success', async () => {
      mockUpdateStudent.mockImplementation((req, res) => {
        res.status(200).json({ student_id: 'B100000001', name: 'Alice', department: 'Bio' });
      });
      const response = await request(app)
        .put('/api/students/1131/B100000001')
        .send({ student_id: 'B100000001', department: 'Bio', group_name: 'A', name: 'Alice' });
      expect(response.status).toBe(200);
      expect(response.body.student_id).toBe('B100000001');
    });

    it('returns 500 on error', async () => {
      mockUpdateStudent.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .put('/api/students/1131/B100000001')
        .send({ student_id: 'B100000001', department: 'Bio', group_name: 'A', name: 'Alice' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('DELETE /api/students/:semester/:studentId', () => {
    it('returns 200 on success', async () => {
      mockDeleteStudent.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Student deleted successfully' });
      });
      const response = await request(app)
        .delete('/api/students/1131/B100000001');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Student deleted successfully');
    });

    it('returns 500 on error', async () => {
      mockDeleteStudent.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .delete('/api/students/1131/B100000001');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('POST /api/students/upload-csv', () => {
    it('returns 200 on success', async () => {
      mockUploadStudentsCSV.mockImplementation((req, res) => {
        res.status(200).json({ message: 'CSV upload processed', summary: { created: 2 } });
      });
      const response = await request(app)
        .post('/api/students/upload-csv')
        .send({ csvData: 'student_id,name,department,group_name\nB100000001,Alice,Bio,A\nS002,Bob,Bio,B', semester: '1131' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('CSV upload processed');
    });

    it('returns 500 on error', async () => {
      mockUploadStudentsCSV.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
      const response = await request(app)
        .post('/api/students/upload-csv')
        .send({ csvData: 'student_id,name,department,group_name\nB100000001,Alice,Bio,A\nS002,Bob,Bio,B', semester: '1131' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });
});
