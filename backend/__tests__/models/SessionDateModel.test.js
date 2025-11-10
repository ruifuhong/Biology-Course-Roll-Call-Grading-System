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
    test('should create lecture date successfully', async () => {
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

    test('should throw error when date already exists', async () => {
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

  describe('getLectureDatesBySemester', () => {
    test('should return lecture dates ordered by actual_date', async () => {
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
  });
});