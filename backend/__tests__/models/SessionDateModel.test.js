import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../../models/database.js', () => ({
  pool: {
    query: mockQuery
  }
}));

const SessionDateModel = await import('../../models/SessionDateModel.js');

describe('SessionDateModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockClear();
  });

  describe('createLectureDate', () => {
    it('should create lecture date successfully', async () => {
      const semester = '1131';
      const actualDate = '2024-10-15';
      const mockExistingResult = { rows: [] };
      const mockInsertResult = { 
        rows: [{ semester, actual_date: actualDate, is_active: false }] 
      };

      mockQuery
        .mockResolvedValueOnce(mockExistingResult)
        .mockResolvedValueOnce(mockInsertResult);

      const result = await SessionDateModel.createLectureDate(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2',
        [semester, actualDate]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        'INSERT INTO "Roll-Call".lecture_dates (semester, actual_date, is_active) VALUES ($1, $2, $3) RETURNING *',
        [semester, actualDate, false]
      );
      expect(result).toEqual({ semester, actual_date: actualDate, is_active: false });
    });

    it('should throw error when date already exists', async () => {
      const semester = '1131';
      const actualDate = '2024-10-15';
      const mockExistingResult = { 
        rows: [{ semester, actual_date: actualDate, is_active: false }] 
      };

      mockQuery.mockResolvedValueOnce(mockExistingResult);

      await expect(SessionDateModel.createLectureDate(semester, actualDate))
        .rejects
        .toThrow(`Date ${actualDate} already exists for semester ${semester}`);
    });
  });

  describe('createDiscussionDate', () => {
    it('should create discussion date successfully', async () => {
      const semester = '1131';
      const actualDate = '2024-10-16';
      const mockExistingResult = { rows: [] };
      const mockInsertResult = {
        rows: [{ semester, actual_date: actualDate, is_active: false }]
      };

      mockQuery
        .mockResolvedValueOnce(mockExistingResult)
        .mockResolvedValueOnce(mockInsertResult);
        
      const result = await SessionDateModel.createDiscussionDate(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2',
        [semester, actualDate]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        'INSERT INTO "Roll-Call".discussion_dates (semester, actual_date, is_active) VALUES ($1, $2, $3) RETURNING *',
        [semester, actualDate, false]
      );
      expect(result).toEqual({ semester, actual_date: actualDate, is_active: false });
    });

    it('should throw error when discussion date already exists', async () => {
      const semester = '1131';
      const actualDate = '2024-10-16';
      const mockExistingResult = {
        rows: [{ semester, actual_date: actualDate, is_active: false }]
      };

      mockQuery.mockResolvedValueOnce(mockExistingResult);

      await expect(SessionDateModel.createDiscussionDate(semester, actualDate))
        .rejects
        .toThrow(`Discussion date ${actualDate} already exists for semester ${semester}`);
    });
  });

  describe('getLectureDate', () => {
    it('should return single lecture date', async () => {
      const semester = '1131';
      const actualDate = '2024-10-15';
      const mockResult = { rows: [{ semester, actual_date: actualDate, is_active: false }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.getLectureDate(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2',
        [semester, actualDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const actualDate = '2024-10-99';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await SessionDateModel.getLectureDate(semester, actualDate);

      expect(result).toBeUndefined();
    });
  });

  describe('getDiscussionDate', () => {
    it('should return single discussion date', async () => {
      const semester = '1131';
      const actualDate = '2024-10-16';
      const mockResult = { rows: [{ semester, actual_date: actualDate, is_active: false }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.getDiscussionDate(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2',
        [semester, actualDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const actualDate = '2024-10-99';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await SessionDateModel.getDiscussionDate(semester, actualDate);

      expect(result).toBeUndefined();
    });
  });

   describe('getLectureDatesBySemester', () => {
    it('should return lecture dates ordered by actual_date', async () => {
      const semester = '1131';
      const mockResult = {
        rows: [
          { semester, actual_date: '2024-10-15', is_active: false },
          { semester, actual_date: '2024-10-22', is_active: true }
        ]
      };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.getLectureDatesBySemester(semester);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 ORDER BY actual_date',
        [semester]
      );
      expect(result).toEqual(mockResult.rows);
    });

    it('should throw an error if the database query fails', async () => {
      const semester = '1131';
      const errorMessage = 'Database error';
      mockQuery.mockRejectedValueOnce(new Error(errorMessage));

      await expect(SessionDateModel.getLectureDatesBySemester(semester))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('getDiscussionDatesBySemester', () => {
    it('should return discussion dates ordered by actual_date', async () => {
      const semester = '1131';
      const mockResult = {
        rows: [
          { semester, actual_date: '2024-10-16', is_active: false },
          { semester, actual_date: '2024-10-23', is_active: true }
        ]
      };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.getDiscussionDatesBySemester(semester);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 ORDER BY actual_date',
        [semester]
      );
      expect(result).toEqual(mockResult.rows);
    });

    it('should throw an error if the database query fails', async () => {
      const semester = '1131';
      const errorMessage = 'Database error';
      mockQuery.mockRejectedValueOnce(new Error(errorMessage));

      await expect(SessionDateModel.getDiscussionDatesBySemester(semester))
      .rejects
      .toThrow(errorMessage);
    });
  });

  describe('updateLectureDate', () => {
    it('should update lecture date', async () => {
      const semester = '1131';
      const oldDate = '2024-10-15';
      const newDate = '2024-10-22';
      const mockResult = { rows: [{ semester, actual_date: newDate, is_active: false }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.updateLectureDate(semester, oldDate, newDate);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE "Roll-Call".lecture_dates SET actual_date = $1 WHERE semester = $2 AND actual_date = $3 RETURNING *',
        [newDate, semester, oldDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const oldDate = '2024-10-99';
      const newDate = '2024-10-22';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await SessionDateModel.updateLectureDate(semester, oldDate, newDate);

      expect(result).toBeUndefined();
    });
  });

  describe('updateDiscussionDate', () => {
    it('should update discussion date', async () => {
      const semester = '1131';
      const oldDate = '2024-10-16';
      const newDate = '2024-10-23';
      const mockResult = { rows: [{ semester, actual_date: newDate, is_active: false }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.updateDiscussionDate(semester, oldDate, newDate);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE "Roll-Call".discussion_dates SET actual_date = $1 WHERE semester = $2 AND actual_date = $3 RETURNING *',
        [newDate, semester, oldDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const oldDate = '2024-10-99';
      const newDate = '2024-10-23';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await SessionDateModel.updateDiscussionDate(semester, oldDate, newDate);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteLectureDate', () => {
    it('should delete lecture date', async () => {
      const semester = '1131';
      const actualDate = '2024-10-15';
      const mockResult = { rows: [{ semester, actual_date: actualDate, is_active: false }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.deleteLectureDate(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2 RETURNING *',
        [semester, actualDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const actualDate = '2024-10-99';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await SessionDateModel.deleteLectureDate(semester, actualDate);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteDiscussionDate', () => {
    it('should delete discussion date', async () => {
      const semester = '1131';
      const actualDate = '2024-10-16';

      const mockResult = { rows: [{ semester, actual_date: actualDate, is_active: false }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.deleteDiscussionDate(semester, actualDate);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2 RETURNING *',
        [semester, actualDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should return undefined if not found', async () => {
      const semester = '1131';
      const actualDate = '2024-10-99';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await SessionDateModel.deleteDiscussionDate(semester, actualDate);

      expect(result).toBeUndefined();
    });
  });

  describe('toggleLectureAttendance', () => {
    it('should toggle lecture attendance', async () => {
      const semester = '1131';
      const selectedDate = '2024-10-15';
      const isActive = true;
      const mockResult = { rows: [{ semester, actual_date: selectedDate, is_active: isActive }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.toggleLectureAttendance(semester, selectedDate, isActive);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE "Roll-Call".lecture_dates SET is_active = $1 WHERE semester = $2 AND actual_date = $3 RETURNING *',
        [isActive, semester, selectedDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });
  });

  describe('toggleDiscussionAttendance', () => {
    it('should toggle discussion attendance', async () => {
      const semester = '1131';
      const selectedDate = '2024-10-16';
      const isActive = true;
      const mockResult = { rows: [{ semester, actual_date: selectedDate, is_active: isActive }] };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await SessionDateModel.toggleDiscussionAttendance(semester, selectedDate, isActive);
      
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE "Roll-Call".discussion_dates SET is_active = $1 WHERE semester = $2 AND actual_date = $3 RETURNING *',
        [isActive, semester, selectedDate]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });
  });
});