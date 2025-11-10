import { jest } from '@jest/globals';

const mockCreateLectureDate = jest.fn();
const mockGetLectureDatesBySemester = jest.fn();

jest.unstable_mockModule('../../models/SessionDateModel.js', () => ({
  createLectureDate: mockCreateLectureDate,
  getLectureDatesBySemester: mockGetLectureDatesBySemester
}));

const SessionController = await import('../../controllers/SessionController.js');

describe('SessionController - Add Session Date Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    mockCreateLectureDate.mockClear();
    mockGetLectureDatesBySemester.mockClear();
  });

  describe('setLectureDates - Main Controller Function', () => {
    it('should create single lecture date successfully', async () => {
      req.body = {
        semester: '1131',
        dates: ['2024-10-15']
      };

      const mockCreatedDate = { 
        semester: '1131', 
        actual_date: '2024-10-15', 
        is_active: false 
      };
      const mockAllDates = [mockCreatedDate];

      mockCreateLectureDate.mockResolvedValueOnce(mockCreatedDate);
      mockGetLectureDatesBySemester.mockResolvedValueOnce(mockAllDates);

      await SessionController.setLectureDates(req, res);

      expect(mockCreateLectureDate).toHaveBeenCalledWith('1131', '2024-10-15');
      expect(mockGetLectureDatesBySemester).toHaveBeenCalledWith('1131');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAllDates);
    });

    it('should create multiple lecture dates successfully', async () => {
      req.body = {
        semester: '1131',
        dates: ['2024-10-15', '2024-10-22', '2024-10-29']
      };

      const mockCreatedDates = [
        { semester: '1131', actual_date: '2024-10-15', is_active: false },
        { semester: '1131', actual_date: '2024-10-22', is_active: false },
        { semester: '1131', actual_date: '2024-10-29', is_active: false }
      ];

      mockCreateLectureDate
        .mockResolvedValueOnce(mockCreatedDates[0])
        .mockResolvedValueOnce(mockCreatedDates[1])
        .mockResolvedValueOnce(mockCreatedDates[2]);
      
      mockGetLectureDatesBySemester.mockResolvedValueOnce(mockCreatedDates);

      await SessionController.setLectureDates(req, res);

      expect(mockCreateLectureDate).toHaveBeenCalledTimes(3);
      expect(mockCreateLectureDate).toHaveBeenNthCalledWith(1, '1131', '2024-10-15');
      expect(mockCreateLectureDate).toHaveBeenNthCalledWith(2, '1131', '2024-10-22');
      expect(mockCreateLectureDate).toHaveBeenNthCalledWith(3, '1131', '2024-10-29');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 for missing semester', async () => {
      req.body = { dates: ['2024-10-15'] };

      await SessionController.setLectureDates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'semester and non-empty dates array are required'
      });
      expect(mockCreateLectureDate).not.toHaveBeenCalled();
    });

    it('should return 400 for missing dates', async () => {
      req.body = { semester: '1131' };

      await SessionController.setLectureDates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'semester and non-empty dates array are required'
      });
    });

    it('should return 400 for empty dates array', async () => {
      req.body = { semester: '1131', dates: [] };

      await SessionController.setLectureDates(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'semester and non-empty dates array are required'
      });
    });

    it('should handle duplicate date error from model', async () => {
      req.body = {
        semester: '1131',
        dates: ['2024-10-15']
      };

      const duplicateError = new Error('Date 2024-10-15 already exists for semester 1131');
      mockCreateLectureDate.mockRejectedValueOnce(duplicateError);

      await SessionController.setLectureDates(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Date 2024-10-15 already exists for semester 1131'
      });
    });

    it('should handle general database errors', async () => {
      req.body = {
        semester: '1131',
        dates: ['2024-10-15']
      };

      const dbError = new Error('Database connection failed');
      mockCreateLectureDate.mockRejectedValueOnce(dbError);

      await SessionController.setLectureDates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to set lecture dates',
        details: 'Database connection failed',
        code: undefined
      });
    });

    it('should stop processing on first error in multiple dates', async () => {
      req.body = {
        semester: '1131',
        dates: ['2024-10-15', '2024-10-22', '2024-10-29']
      };

      const duplicateError = new Error('Date 2024-10-15 already exists for semester 1131');
      mockCreateLectureDate.mockRejectedValueOnce(duplicateError);

      await SessionController.setLectureDates(req, res);

      expect(mockCreateLectureDate).toHaveBeenCalledTimes(1);
      expect(mockCreateLectureDate).toHaveBeenCalledWith('1131', '2024-10-15');
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});