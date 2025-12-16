import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../../models/database.js', () => ({
  pool: {
    query: mockQuery
  }
}));

const StudentModel = await import('../../models/StudentModel.js');

describe('StudentModel', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
  });

  describe('createStudent', () => {
    it('should create student successfully', async () => {
      const studentData = {
        student_id: 'B100000001',
        semester: '1131',
        department: 'Biology',
        group_name: '1',
        name: 'John Doe'
      };

      const mockResult = { rows: [studentData] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await StudentModel.createStudent(studentData);

      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO "Roll-Call".students (student_id, semester, department, group_name, name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [studentData.student_id, studentData.semester, studentData.department, studentData.group_name, studentData.name]
      );
      expect(result).toEqual(studentData);
    });

    it('should throw error if studentData is empty', async () => {
      const studentData = {};
      const mockResult = { rows: [{}] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await StudentModel.createStudent(studentData);

      expect(mockQuery).toHaveBeenCalledWith(
      'INSERT INTO "Roll-Call".students (student_id, semester, department, group_name, name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [undefined, undefined, undefined, undefined, undefined]
      );
      expect(result).toEqual({});
    });

    it('should throw error on db failure', async () => {
      const studentData = {
        student_id: 'B100000001',
        semester: '1131',
        department: 'Biology',
        group_name: '1',
        name: 'Alice'
      };

      mockQuery.mockRejectedValueOnce(new Error('DB error'));

      await expect(StudentModel.createStudent(studentData)).rejects.toThrow('DB error');
    });
  });

  describe('findStudentsBySemester', () => {
    it('should return students for semester', async () => {

      const semester = '1131';
      const mockRows = [
        { student_id: 'B100000001', semester, department: 'Biology', group_name: '1', name: 'John Doe' },
        { student_id: 'B100000002', semester, department: 'Biology', group_name: 'B', name: 'Bob' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await StudentModel.findStudentsBySemester(semester);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM "Roll-Call".students WHERE semester = $1 ORDER BY student_id',
        [semester]
      );
      expect(result).toEqual(mockRows);
    });

    it('should return undefined if no students found for semester', async () => {
      const semester = '1131';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await StudentModel.findStudentsBySemester(semester);

      expect(result).toEqual([]);
    });

    it('should throw error on db failure', async () => {
      const semester = '1131';

      mockQuery.mockRejectedValueOnce(new Error('DB error'));

      await expect(StudentModel.findStudentsBySemester(semester)).rejects.toThrow('DB error');
    });
  });

  describe('findStudentById', () => {
    it('should return student by id', async () => {
      const semester = '1131';
      const studentId = 'B100000001';
      const mockRow = { student_id: studentId, semester, department: 'Biology', group_name: '1', name: 'John Doe' };

      mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await StudentModel.findStudentById(semester, studentId);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM "Roll-Call".students WHERE semester = $1 AND student_id = $2',
        [semester, studentId]
      );
      expect(result).toEqual(mockRow);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const studentId = 'B100000001';

      mockQuery.mockResolvedValueOnce({ rows: [] });
      const result = await StudentModel.findStudentById(semester, studentId);

      expect(result).toBeUndefined();
    });

    it('should throw error on db failure', async () => {
      const semester = '1131';
      const studentId = 'B100000001';

      mockQuery.mockRejectedValueOnce(new Error('DB error'));

      await expect(StudentModel.findStudentById(semester, studentId)).rejects.toThrow('DB error');
    });
  });

  describe('updateStudent', () => {
    it('should update student successfully', async () => {
      const semester = '1131';
      const studentId = 'B100000001';
      const studentData = {
        student_id: 'B100000001',
        department: 'Biology',
        group_name: '1',
        name: 'John Doe'
      };

      const mockRow = { ...studentData, semester };
      mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await StudentModel.updateStudent(semester, studentId, studentData);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE "Roll-Call".students SET student_id = $1, department = $2, group_name = $3, name = $4 WHERE semester = $5 AND student_id = $6 RETURNING *',
        [studentData.student_id, studentData.department, studentData.group_name, studentData.name, semester, studentId]
      );

      expect(result).toEqual(mockRow);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const studentId = 'B100000001';
      const studentData = {
        student_id: 'B100000001',
        department: 'Biology',
        group_name: '1',
        name: 'John Doe'
      };

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await StudentModel.updateStudent(semester, studentId, studentData);

      expect(result).toBeUndefined();
    });

    it('should throw error on db failure', async () => {
      const semester = '1131';
      const studentId = 'B100000001';
      const studentData = {
        student_id: 'B100000001',
        department: 'Biology',
        group_name: '1',
        name: 'Alice Updated'
      };

      mockQuery.mockRejectedValueOnce(new Error('DB error'));

      await expect(StudentModel.updateStudent(semester, studentId, studentData)).rejects.toThrow('DB error');
    });
  });

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      const semester = '1131';
      const studentId = 'B100000001';
      const mockRow = { student_id: studentId, semester, department: 'Biology', group_name: '1', name: 'John Doe' };

      mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await StudentModel.deleteStudent(semester, studentId);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM "Roll-Call".students WHERE semester = $1 AND student_id = $2 RETURNING *',
        [semester, studentId]
      );

      expect(result).toEqual(mockRow);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const studentId = 'B100000001';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await StudentModel.deleteStudent(semester, studentId);
      
      expect(result).toBeUndefined();
    });

    it('should throw error on db failure', async () => {
      const semester = '1131';
      const studentId = 'B100000001';

      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      
      await expect(StudentModel.deleteStudent(semester, studentId)).rejects.toThrow('DB error');
    });
  });
});
