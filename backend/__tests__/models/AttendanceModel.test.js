import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../../models/database.js', () => ({
  pool: {
    query: mockQuery
  }
}));

const { default: AttendanceModel } = await import('../../models/AttendanceModel.js');

describe('AttendanceModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
  });

  describe('isLectureAttendanceActive', () => {
    it('returns true when active', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ is_active: true }] });

      const semester = '1131';
      const sessionOrder = 1;
      const expectedQuery = `\n      SELECT is_active FROM "Roll-Call".lecture_dates \n      WHERE semester = $1 AND session_order = $2;\n    `;
      const expectedParams = [semester, sessionOrder];

      const result = await AttendanceModel.isLectureAttendanceActive(semester, sessionOrder);

      expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
      expect(result).toBe(true);
    });

    it('returns false when not active', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ is_active: false }] });

      const result = await AttendanceModel.isLectureAttendanceActive('1131', 1);

      expect(result).toBe(false);
    });
  });

  describe('isDiscussionAttendanceActive', () => {
    it('returns true when active', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ is_active: true }] });

      const semester = '1131';
      const actualDate = '2024-10-15';
      const expectedQuery = `\n      SELECT is_active FROM "Roll-Call".discussion_dates \n      WHERE semester = $1 AND actual_date = $2;\n    `;
      const expectedParams = [semester, actualDate];

      const result = await AttendanceModel.isDiscussionAttendanceActive(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
      expect(result).toBe(true);
    });

    it('returns false when not active', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ is_active: false }] });

      const result = await AttendanceModel.isDiscussionAttendanceActive('1131', '2024-10-15');
      
      expect(result).toBe(false);
    });
  });

  describe('markLectureAttendance', () => {
    it('marks attendance when active and not submitted', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ is_active: true }] }) // active check
        .mockResolvedValueOnce({ rows: [] }) // not submitted
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'present' }] }); // insert

      const semester = '1131';
      const studentId = 'B100000001';
      const actualDate = '2024-10-15';
      const status = 'present';

      const expectedActiveQuery = 'SELECT is_active FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2;';
      const expectedActiveParams = [semester, actualDate];
      const expectedCheckQuery = '\n      SELECT * FROM "Roll-Call".attendance_lecture\n      WHERE semester = $1 AND student_id = $2 AND actual_date = $3;\n    ';
      const expectedCheckParams = [semester, studentId, actualDate];
      const expectedInsertQuery = '\n      INSERT INTO "Roll-Call".attendance_lecture (semester, student_id, actual_date, status)\n      VALUES ($1, $2, $3, $4)\n      RETURNING *;\n    ';
      const expectedInsertParams = [semester, studentId, actualDate, status];

      const result = await AttendanceModel.markLectureAttendance(semester, studentId, actualDate);

      expect(mockQuery).toHaveBeenNthCalledWith(1, expectedActiveQuery, expectedActiveParams);
      expect(mockQuery).toHaveBeenNthCalledWith(2, expectedCheckQuery, expectedCheckParams);
      expect(mockQuery).toHaveBeenNthCalledWith(3, expectedInsertQuery, expectedInsertParams);
      expect(result).toEqual({ id: 1, status: 'present' });
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('throws error if not active', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ is_active: false }] });

      await expect(
        AttendanceModel.markLectureAttendance('1131', 'B100000001', '2024-10-15')
      ).rejects.toThrow('Attendance submission is not currently open for this session');
    });

    it('throws error if already submitted', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ is_active: true }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(
        AttendanceModel.markLectureAttendance('1131', 'B100000001', '2024-10-15')
      ).rejects.toThrow('Attendance has already been submitted for this session');
    });
  });

  describe('markDiscussionAttendance', () => {
    it('marks attendance when active and not submitted', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ is_active: true }] }) // active check
        .mockResolvedValueOnce({ rows: [] }) // not submitted
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'present' }] }); // insert

      const semester = '1131';
      const studentId = 'B100000001';
      const actualDate = '2024-10-15';
      const status = 'present';

      const expectedActiveQuery = '\n      SELECT is_active FROM "Roll-Call".discussion_dates \n      WHERE semester = $1 AND actual_date = $2;\n    ';
      const expectedActiveParams = [semester, actualDate];
      const expectedCheckQuery = '\n      SELECT * FROM "Roll-Call".attendance_discussion\n      WHERE semester = $1 AND student_id = $2 AND actual_date = $3;\n    ';
      const expectedCheckParams = [semester, studentId, actualDate];
      const expectedInsertQuery = '\n      INSERT INTO "Roll-Call".attendance_discussion (semester, student_id, actual_date, status)\n      VALUES ($1, $2, $3, $4)\n      RETURNING *;\n    ';
      const expectedInsertParams = [semester, studentId, actualDate, status];

      const result = await AttendanceModel.markDiscussionAttendance(semester, studentId, actualDate);

      expect(mockQuery).toHaveBeenNthCalledWith(1, expectedActiveQuery, expectedActiveParams);
      expect(mockQuery).toHaveBeenNthCalledWith(2, expectedCheckQuery, expectedCheckParams);
      expect(mockQuery).toHaveBeenNthCalledWith(3, expectedInsertQuery, expectedInsertParams);
      expect(result).toEqual({ id: 1, status: 'present' });
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('throws error if not active', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ is_active: false }] });

      await expect(
        AttendanceModel.markDiscussionAttendance('1131', 'B100000001', '2024-10-15')
      ).rejects.toThrow('Attendance submission is not currently open for this session');
    });
    
    it('throws error if already submitted', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ is_active: true }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });
        
      await expect(
        AttendanceModel.markDiscussionAttendance('1131', 'B100000001', '2024-10-15')
      ).rejects.toThrow('Attendance has already been submitted for this session');
    });
  });

  describe('getLectureAttendance', () => {
    it('returns all lecture attendance for student', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });

      const semester = '1131';
      const studentId = 'B100000001';
      const expectedQuery = '\n      SELECT * FROM "Roll-Call".attendance_lecture \n      WHERE semester = $1 AND student_id = $2;\n    ';
      const expectedParams = [semester, studentId];

      const result = await AttendanceModel.getLectureAttendance(semester, studentId);

      expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
    
    it('returns empty array if none found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await AttendanceModel.getLectureAttendance('1131', 'B100000001');

      expect(result).toEqual([]);
    });
  });

  describe('getDiscussionAttendance', () => {
    it('returns all discussion attendance for student', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });

      const semester = '1131';
      const studentId = 'B100000001';
      const expectedQuery = '\n      SELECT * FROM "Roll-Call".attendance_discussion \n      WHERE semester = $1 AND student_id = $2;\n    ';
      const expectedParams = [semester, studentId];

      const result = await AttendanceModel.getDiscussionAttendance(semester, studentId);

      expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('returns empty array if none found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await AttendanceModel.getDiscussionAttendance('1131', 'B100000001');

      expect(result).toEqual([]);
    });
  });

  describe('getAllLectureAttendance', () => {
    it('returns all students lecture attendance for semester', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ student_id: 'B100000001' }, { student_id: 'B100000002' }] });

      const semester = '1131';
      const expectedQuery = '\n      SELECT s.student_id, s.name, s.department, s.group_name, a.actual_date, a.status\n      FROM "Roll-Call".students s\n      LEFT JOIN "Roll-Call".attendance_lecture a\n        ON s.semester = a.semester AND s.student_id = a.student_id\n      WHERE s.semester = $1\n      ORDER BY s.group_name, s.student_id, a.actual_date;\n    ';
      const expectedParams = [semester];

      const result = await AttendanceModel.getAllLectureAttendance(semester);

      expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
      expect(result).toEqual([{ student_id: 'B100000001' }, { student_id: 'B100000002' }]);
    });

    it('handles students with no attendance', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ student_id: 'B100000001', actual_date: null }] });

      const result = await AttendanceModel.getAllLectureAttendance('1131');

      expect(result).toEqual([{ student_id: 'B100000001', actual_date: null }]);
    });
  });

  describe('getAllDiscussionAttendance', () => {
    it('returns all students discussion attendance for semester', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ student_id: 'B100000001' }, { student_id: 'B100000002' }] });

      const semester = '1131';
      const expectedQuery = '\n      SELECT s.student_id, s.name, s.department, s.group_name, a.actual_date, a.status\n      FROM "Roll-Call".students s\n      LEFT JOIN "Roll-Call".attendance_discussion a\n        ON s.semester = a.semester AND s.student_id = a.student_id\n      WHERE s.semester = $1\n      ORDER BY s.group_name, s.student_id, a.actual_date;\n    ';
      const expectedParams = [semester];

      const result = await AttendanceModel.getAllDiscussionAttendance(semester);

      expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
      expect(result).toEqual([{ student_id: 'B100000001' }, { student_id: 'B100000002' }]);
    });

    it('handles students with no attendance', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ student_id: 'B100000001', actual_date: null }] });

      const result = await AttendanceModel.getAllDiscussionAttendance('1131');

      expect(result).toEqual([{ student_id: 'B100000001', actual_date: null }]);
    });
  });

  describe('error handling', () => {
    it('handles database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      
      await expect(
        AttendanceModel.isLectureAttendanceActive('1131', 1)
      ).rejects.toThrow('DB error');
    });
  });
});
