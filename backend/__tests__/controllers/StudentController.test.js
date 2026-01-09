import { jest } from '@jest/globals';

const mockCreateStudent = jest.fn();
const mockFindStudentsBySemester = jest.fn();
const mockFindStudentById = jest.fn();
const mockUpdateStudent = jest.fn();
const mockDeleteStudent = jest.fn();

jest.unstable_mockModule('../../models/StudentModel.js', () => ({
  createStudent: mockCreateStudent,
  findStudentsBySemester: mockFindStudentsBySemester,
  findStudentById: mockFindStudentById,
  updateStudent: mockUpdateStudent,
  deleteStudent: mockDeleteStudent
}));

const StudentController = await import('../../controllers/StudentController.js');

describe('StudentController - createStudent', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockCreateStudent.mockClear();
  });

  it('should create a student with valid data', async () => {
    req.body = {
      student_id: 'B100000001',
      semester: '1131',
      department: 'Bio',
      group_name: 'A',
      name: 'Alice'
    };

    const mockStudent = { ...req.body };

    mockCreateStudent.mockResolvedValueOnce(mockStudent);

    await StudentController.createStudent(req, res);

    expect(mockCreateStudent).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockStudent);
  });

  it('should return 400 if required fields are missing', async () => {
    req.body = { student_id: 'B100000001', semester: '1131', department: 'Bio' };

    await StudentController.createStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'student_id, semester, department, and name are required' });
    expect(mockCreateStudent).not.toHaveBeenCalled();
  });

  it('should handle model/database errors', async () => {
    req.body = {
      student_id: 'B100000001',
      semester: '1131',
      department: 'Bio',
      group_name: 'A',
      name: 'Alice'
    };

    const dbError = new Error('DB error');

    mockCreateStudent.mockRejectedValueOnce(dbError);

    await StudentController.createStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});

describe('StudentController - getStudentsBySemester', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockFindStudentsBySemester.mockClear();
  });

  it('should return students for a given semester', async () => {
    req.params = { semester: '1131' };

    const mockStudents = [
      { student_id: 'B100000001', semester: '1131', name: 'Alice' },
      { student_id: 'B100000002', semester: '1131', name: 'Bob' }
    ];

    mockFindStudentsBySemester.mockResolvedValueOnce(mockStudents);

    await StudentController.getStudentsBySemester(req, res);

    expect(mockFindStudentsBySemester).toHaveBeenCalledWith('1131');
    expect(res.json).toHaveBeenCalledWith(mockStudents);
  });

  it('should return 400 if semester param is missing', async () => {
    req.params = {};

    await StudentController.getStudentsBySemester(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'semester parameter is required' });
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131' };

    const dbError = new Error('DB error');

    mockFindStudentsBySemester.mockRejectedValueOnce(dbError);

    await StudentController.getStudentsBySemester(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});

describe('StudentController - getStudentById', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockFindStudentById.mockClear();
  });

  it('should return student if found', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    const mockStudent = { student_id: 'B100000001', semester: '1131', name: 'Alice' };

    mockFindStudentById.mockResolvedValueOnce(mockStudent);

    await StudentController.getStudentById(req, res);

    expect(mockFindStudentById).toHaveBeenCalledWith('1131', 'B100000001');
    expect(res.json).toHaveBeenCalledWith(mockStudent);
  });

  it('should return 404 if not found', async () => {
    req.params = { semester: '1131', studentId: 'S999' };

    mockFindStudentById.mockResolvedValueOnce(undefined);

    await StudentController.getStudentById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    const dbError = new Error('DB error');

    mockFindStudentById.mockRejectedValueOnce(dbError);

    await StudentController.getStudentById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});

describe('StudentController - updateStudent', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockUpdateStudent.mockClear();
  });

  it('should update student with valid data', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    req.body = {
      student_id: 'B100000001',
      department: 'Bio',
      group_name: 'A',
      name: 'Alice'
    };

    const mockUpdated = { ...req.body, semester: '1131' };

    mockUpdateStudent.mockResolvedValueOnce(mockUpdated);

    await StudentController.updateStudent(req, res);

    expect(mockUpdateStudent).toHaveBeenCalledWith('1131', 'B100000001', req.body);
    expect(res.json).toHaveBeenCalledWith(mockUpdated);
  });

  it('should return 404 if student not found', async () => {
    req.params = { semester: '1131', studentId: 'S999' };

    req.body = {
      student_id: 'S999',
      department: 'Bio',
      group_name: 'A',
      name: 'Ghost'
    };

    mockUpdateStudent.mockResolvedValueOnce(undefined);

    await StudentController.updateStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    req.body = {
      student_id: 'B100000001',
      department: 'Bio',
      group_name: 'A',
      name: 'Alice'
    };

    const dbError = new Error('DB error');

    mockUpdateStudent.mockRejectedValueOnce(dbError);

    await StudentController.updateStudent(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});

describe('StudentController - deleteStudent', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockDeleteStudent.mockClear();
  });

  it('should delete student if found', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    const mockDeleted = { student_id: 'B100000001', semester: '1131', name: 'Alice' };

    mockDeleteStudent.mockResolvedValueOnce(mockDeleted);

    await StudentController.deleteStudent(req, res);

    expect(mockDeleteStudent).toHaveBeenCalledWith('1131', 'B100000001');
    expect(res.json).toHaveBeenCalledWith({ message: 'Student deleted successfully', student: mockDeleted });
  });

  it('should return 404 if not found', async () => {
    req.params = { semester: '1131', studentId: 'S999' };

    mockDeleteStudent.mockResolvedValueOnce(undefined);

    await StudentController.deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    const dbError = new Error('DB error');

    mockDeleteStudent.mockRejectedValueOnce(dbError);

    await StudentController.deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});

describe('StudentController - uploadStudentsCSV', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockCreateStudent.mockClear();
  });

  it('should process valid CSV and create students', async () => {
    req.body = {
      csvData: 'student_id,name,department,group_name\nB100000001,Alice,Bio,A\nB100000002,Bob,Bio,B',
      semester: '1131'
    };

    mockCreateStudent.mockResolvedValueOnce({ student_id: 'B100000001', name: 'Alice', department: 'Bio', group_name: 'A', semester: '1131' });
    mockCreateStudent.mockResolvedValueOnce({ student_id: 'B100000002', name: 'Bob', department: 'Bio', group_name: 'B', semester: '1131' });

    await StudentController.uploadStudentsCSV(req, res);

    expect(mockCreateStudent).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'CSV upload processed',
      summary: expect.objectContaining({ created: 2 })
    }));
  });

  it('should return 400 if csvData or semester missing', async () => {
    req.body = { csvData: '', semester: '' };

    await StudentController.uploadStudentsCSV(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'csvData and semester are required' });
  });

  it('should return 400 if required headers missing', async () => {
    req.body = {
      csvData: 'student_id,name\nB100000001,Alice',
      semester: '1131'
    };

    await StudentController.uploadStudentsCSV(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Missing required headers') });
  });

  it('should report parse errors for malformed rows', async () => {
    req.body = {
      csvData: 'student_id,name,department,group_name\nB100000001,Alice,Bio\nB100000002,Bob,Bio,B',
      semester: '1131'
    };

    mockCreateStudent.mockResolvedValueOnce({ student_id: 'B100000002', name: 'Bob', department: 'Bio', group_name: 'B', semester: '1131' });

    await StudentController.uploadStudentsCSV(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      errors: expect.objectContaining({ parseErrors: expect.any(Array) })
    }));
  });

  it('should return 400 if all rows are malformed', async () => {
    req.body = {
      csvData: 'student_id,name,department,group_name\nB100000001,Alice,Bio\nB100000002,Bob,Bio',
      semester: '1131'
    };

    await StudentController.uploadStudentsCSV(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'No valid student rows found',
      errors: expect.objectContaining({ parseErrors: expect.any(Array) })
    }));
  });
  
  it('should return 500 on unexpected error', async () => {
  req.body = null;

  await StudentController.uploadStudentsCSV(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    error: expect.any(String)
  }));
});
});
