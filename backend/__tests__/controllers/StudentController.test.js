import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { jest } from '@jest/globals';

// Create mock functions for StudentModel
const mockStudentModel = {
  findStudentsBySemester: jest.fn(),
  createStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
  findStudentById: jest.fn()
};

// Mock the StudentModel module before importing anything that uses it
jest.unstable_mockModule('../../models/StudentModel.js', () => mockStudentModel);

// Now dynamically import the controller after the mock is set up
const { 
  createStudent,
  getStudentsBySemester,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentsCSV
} = await import('../../controllers/StudentController.js');

// Create test app instance with direct controller usage instead of routes
const app = express();
app.use(cors());
app.use(express.json());

// Set up routes manually to ensure mocked controllers are used
app.post('/students', createStudent);
app.get('/students/:semester', getStudentsBySemester);
app.get('/students/:semester/:studentId', getStudentById);
app.put('/students/:semester/:studentId', updateStudent);
app.delete('/students/:semester/:studentId', deleteStudent);
app.post('/students/upload-csv', uploadStudentsCSV);

describe('StudentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /students/:semester', () => {
    test('returns students for valid semester', async () => {
      const mockStudents = [
        { student_id: '1001', name: 'John Doe', department: 'CS', group_name: '1' },
        { student_id: '1002', name: 'Jane Smith', department: 'EE', group_name: '2' }
      ];
      
      mockStudentModel.findStudentsBySemester.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/students/1131')
        .expect(200);

      expect(response.body).toEqual(mockStudents);
      expect(mockStudentModel.findStudentsBySemester).toHaveBeenCalledWith('1131');
    });

    test('returns empty array when no students found', async () => {
      mockStudentModel.findStudentsBySemester.mockResolvedValue([]);

      const response = await request(app)
        .get('/students/1131')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('handles database errors', async () => {
      mockStudentModel.findStudentsBySemester.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/students/1131')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /students/:semester/:studentId', () => {
    test('returns student by ID successfully', async () => {
      const mockStudent = { student_id: '1001', name: 'John Doe', department: 'CS', group_name: '1' };
      
      mockStudentModel.findStudentById.mockResolvedValue(mockStudent);

      const response = await request(app)
        .get('/students/1131/1001')
        .expect(200);

      expect(response.body).toEqual(mockStudent);
      expect(mockStudentModel.findStudentById).toHaveBeenCalledWith('1131', '1001');
    });

    test('returns 404 for non-existent student', async () => {
      mockStudentModel.findStudentById.mockResolvedValue(null);

      const response = await request(app)
        .get('/students/1131/9999')
        .expect(404);

      expect(response.body.error).toBe('Student not found');
    });

    test('handles database errors', async () => {
      mockStudentModel.findStudentById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/students/1131/1001')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /students', () => {
    test('creates student successfully', async () => {
      const newStudent = {
        student_id: '1003',
        name: 'Bob Johnson',
        department: 'ME',
        group_name: '3',
        semester: '1131'
      };

      mockStudentModel.createStudent.mockResolvedValue(newStudent);

      const response = await request(app)
        .post('/students')
        .send(newStudent)
        .expect(201);

      expect(response.body).toEqual(newStudent);
      expect(mockStudentModel.createStudent).toHaveBeenCalledWith({
        student_id: '1003',
        semester: '1131',
        department: 'ME',
        group_name: '3',
        name: 'Bob Johnson'
      });
    });

    test('validates required fields - missing student_id', async () => {
      const invalidStudent = {
        name: 'Bob Johnson',
        department: 'ME',
        semester: '1131'
      };

      const response = await request(app)
        .post('/students')
        .send(invalidStudent)
        .expect(400);

      expect(response.body.error).toBe('student_id, semester, department, and name are required');
    });

    test('validates required fields - missing semester', async () => {
      const invalidStudent = {
        student_id: '1003',
        name: 'Bob Johnson',
        department: 'ME'
      };

      const response = await request(app)
        .post('/students')
        .send(invalidStudent)
        .expect(400);

      expect(response.body.error).toBe('student_id, semester, department, and name are required');
    });

    test('validates required fields - missing department', async () => {
      const invalidStudent = {
        student_id: '1003',
        name: 'Bob Johnson',
        semester: '1131'
      };

      const response = await request(app)
        .post('/students')
        .send(invalidStudent)
        .expect(400);

      expect(response.body.error).toBe('student_id, semester, department, and name are required');
    });

    test('validates required fields - missing name', async () => {
      const invalidStudent = {
        student_id: '1003',
        department: 'ME',
        semester: '1131'
      };

      const response = await request(app)
        .post('/students')
        .send(invalidStudent)
        .expect(400);

      expect(response.body.error).toBe('student_id, semester, department, and name are required');
    });

    test('handles duplicate student_id error', async () => {
      const duplicateStudent = {
        student_id: '1001',
        name: 'Bob Johnson',
        department: 'ME',
        group_name: '3',
        semester: '1131'
      };

      mockStudentModel.createStudent.mockRejectedValue(new Error('duplicate key value violates unique constraint'));

      const response = await request(app)
        .post('/students')
        .send(duplicateStudent)
        .expect(500);

      expect(response.body.error).toBe('duplicate key value violates unique constraint');
    });
  });

  describe('PUT /students/:semester/:studentId', () => {
    test('updates student successfully', async () => {
      const updateData = {
        student_id: '1001',
        name: 'John Doe Updated',
        department: 'CS',
        group_name: '2'
      };
      
      const updatedStudent = { ...updateData, semester: '1131' };
      mockStudentModel.updateStudent.mockResolvedValue(updatedStudent);

      const response = await request(app)
        .put('/students/1131/1001')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedStudent);
      expect(mockStudentModel.updateStudent).toHaveBeenCalledWith('1131', '1001', updateData);
    });

    test('returns 404 for non-existent student', async () => {
      mockStudentModel.updateStudent.mockResolvedValue(null);

      const response = await request(app)
        .put('/students/1131/9999')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.error).toBe('Student not found');
    });

    test('handles database errors', async () => {
      mockStudentModel.updateStudent.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/students/1131/1001')
        .send({ name: 'Updated Name' })
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('DELETE /students/:semester/:studentId', () => {
    test('deletes student successfully', async () => {
      const deletedStudent = { student_id: '1001', name: 'John Doe', department: 'CS' };
      mockStudentModel.deleteStudent.mockResolvedValue(deletedStudent);

      const response = await request(app)
        .delete('/students/1131/1001')
        .expect(200);

      expect(response.body.message).toBe('Student deleted successfully');
      expect(response.body.student).toEqual(deletedStudent);
      expect(mockStudentModel.deleteStudent).toHaveBeenCalledWith('1131', '1001');
    });

    test('returns 404 for non-existent student', async () => {
      mockStudentModel.deleteStudent.mockResolvedValue(null);

      const response = await request(app)
        .delete('/students/1131/9999')
        .expect(404);

      expect(response.body.error).toBe('Student not found');
    });

    test('handles database errors', async () => {
      mockStudentModel.deleteStudent.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/students/1131/1001')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /students/upload-csv', () => {
    test('processes CSV data successfully', async () => {
      const csvData = 'student_id,name,department,group_name\n1001,John Doe,CS,1\n1002,Jane Smith,EE,2';
      
      const createdStudent1 = { student_id: '1001', name: 'John Doe', department: 'CS', group_name: '1', semester: '1131' };
      const createdStudent2 = { student_id: '1002', name: 'Jane Smith', department: 'EE', group_name: '2', semester: '1131' };
      
      mockStudentModel.createStudent
        .mockResolvedValueOnce(createdStudent1)
        .mockResolvedValueOnce(createdStudent2);

      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData, semester: '1131' })
        .expect(201);

      expect(response.body.message).toBe('CSV upload processed');
      expect(response.body.summary.totalRows).toBe(2);
      expect(response.body.summary.parsed).toBe(2);
      expect(response.body.summary.created).toBe(2);
      expect(response.body.summary.parseErrors).toBe(0);
      expect(response.body.summary.dbErrors).toBe(0);
      expect(response.body.created).toEqual([createdStudent1, createdStudent2]);
    });

    test('handles missing required headers', async () => {
      const invalidCsvData = 'student_id,name,department\n1001,John Doe,CS';

      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: invalidCsvData, semester: '1131' })
        .expect(400);

      expect(response.body.error).toBe('Missing required headers: group_name');
    });

    test('handles multiple missing required headers', async () => {
      const invalidCsvData = 'student_id,name\n1001,John Doe';

      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: invalidCsvData, semester: '1131' })
        .expect(400);

      expect(response.body.error).toBe('Missing required headers: department, group_name');
    });

    test('handles column count mismatch', async () => {
      const invalidCsvData = 'student_id,name,department,group_name\n1001,John Doe,CS\n1002,Jane Smith,EE,2';

      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: invalidCsvData, semester: '1131' })
        .expect(201);

      expect(response.body.summary.parseErrors).toBe(1);
      expect(response.body.errors.parseErrors[0].error).toBe('Column count mismatch');
      expect(response.body.errors.parseErrors[0].row).toBe(2);
    });

    test('handles missing required fields in CSV rows', async () => {
      const invalidCsvData = 'student_id,name,department,group_name\n1001,,CS,1\n,Jane Smith,EE,2';

      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: invalidCsvData, semester: '1131' })
        .expect(201);

      expect(response.body.summary.parseErrors).toBe(2);
      expect(response.body.errors.parseErrors[0].error).toBe('Missing required fields (student_id, name, department, group_name)');
      expect(response.body.errors.parseErrors[1].error).toBe('Missing required fields (student_id, name, department, group_name)');
    });

    test('handles database errors during CSV upload', async () => {
      const csvData = 'student_id,name,department,group_name\n1001,John Doe,CS,1\n1002,Jane Smith,EE,2';
      
      mockStudentModel.createStudent
        .mockResolvedValueOnce({ student_id: '1001' })
        .mockRejectedValueOnce(new Error('Database constraint violation'));

      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData, semester: '1131' })
        .expect(201);

      expect(response.body.summary.created).toBe(1);
      expect(response.body.summary.dbErrors).toBe(1);
      expect(response.body.errors.dbErrors[0].error).toBe('Database constraint violation');
    });

    test('handles empty CSV data', async () => {
      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: '', semester: '1131' })
        .expect(400);

      expect(response.body.error).toBe('csvData and semester are required');
    });

    test('handles missing csvData', async () => {
      const response = await request(app)
        .post('/students/upload-csv')
        .send({ semester: '1131' })
        .expect(400);

      expect(response.body.error).toBe('csvData and semester are required');
    });

    test('handles missing semester', async () => {
      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: 'student_id,name\n1001,John' })
        .expect(400);

      expect(response.body.error).toBe('csvData and semester are required');
    });

    test('handles CSV upload with general error', async () => {
      const response = await request(app)
        .post('/students/upload-csv')
        .send({ csvData: 'invalid csv format that causes parsing error' })
        .expect(400);

      expect(response.body.error).toBe('csvData and semester are required');
    });
  });
});