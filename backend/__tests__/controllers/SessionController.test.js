import { jest } from '@jest/globals';

const mockCreateLectureDate = jest.fn();
const mockGetLectureDatesBySemester = jest.fn();
const mockCreateDiscussionDate = jest.fn();
const mockGetDiscussionDatesBySemester = jest.fn();
const mockUpdateLectureDate = jest.fn();
const mockUpdateDiscussionDate = jest.fn();
const mockDeleteLectureDate = jest.fn();
const mockDeleteDiscussionDate = jest.fn();
const mockToggleLectureAttendance = jest.fn();
const mockToggleDiscussionAttendance = jest.fn();

jest.unstable_mockModule('../../models/SessionDateModel.js', () => ({
  createLectureDate: mockCreateLectureDate,
  getLectureDatesBySemester: mockGetLectureDatesBySemester,
  createDiscussionDate: mockCreateDiscussionDate,
  getDiscussionDatesBySemester: mockGetDiscussionDatesBySemester,
  updateLectureDate: mockUpdateLectureDate,
  updateDiscussionDate: mockUpdateDiscussionDate,
  deleteLectureDate: mockDeleteLectureDate,
  deleteDiscussionDate: mockDeleteDiscussionDate,
  toggleLectureAttendance: mockToggleLectureAttendance,
  toggleDiscussionAttendance: mockToggleDiscussionAttendance
}));

const SessionController = await import('../../controllers/SessionController.js');

describe('SessionController - Add Session Date Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(),json: jest.fn() };

    jest.clearAllMocks();
    mockCreateLectureDate.mockClear();
    mockGetLectureDatesBySemester.mockClear();
  });

  describe('SessionController - setLectureDates', () => {
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
  });
});

describe('SessionController - setDiscussionDates', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockCreateDiscussionDate.mockClear();
    mockGetDiscussionDatesBySemester.mockClear();
  });

  describe('setDiscussionDates', () => {
    it('should create discussion dates successfully', async () => {
      req.body = { semester: '1131', dates: ['2024-10-16'] };

      const mockCreatedDate = { semester: '1131', actual_date: '2024-10-16', is_active: false };
      const mockAllDates = [mockCreatedDate];

      mockCreateDiscussionDate.mockResolvedValueOnce(mockCreatedDate);
      mockGetDiscussionDatesBySemester.mockResolvedValueOnce(mockAllDates);

      await SessionController.setDiscussionDates(req, res);

      expect(mockCreateDiscussionDate).toHaveBeenCalledWith('1131', '2024-10-16');
      expect(mockGetDiscussionDatesBySemester).toHaveBeenCalledWith('1131');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAllDates);
    });

    it('should return 400 for missing semester', async () => {
      req.body = { dates: ['2024-10-16'] };

      await SessionController.setDiscussionDates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'semester and non-empty dates array are required' });
      expect(mockCreateDiscussionDate).not.toHaveBeenCalled();
    });

    it('should return 400 for missing dates', async () => {
      req.body = { semester: '1131' };

      await SessionController.setDiscussionDates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
      error: 'semester and non-empty dates array are required'
      });
    });

    it('should handle duplicate date error from model', async () => {
      req.body = { semester: '1131', dates: ['2024-10-16'] };

      const duplicateError = new Error('Date 2024-10-16 already exists for semester 1131');

      mockCreateDiscussionDate.mockRejectedValueOnce(duplicateError);

      await SessionController.setDiscussionDates(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Date 2024-10-16 already exists for semester 1131' });
    });

    it('should handle general database errors', async () => {
      req.body = { semester: '1131', dates: ['2024-10-16'] };

      const dbError = new Error('Database connection failed');

      mockCreateDiscussionDate.mockRejectedValueOnce(dbError);

      await SessionController.setDiscussionDates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to set discussion dates', details: 'Database connection failed', code: undefined });
    });
  });
});

describe('SessionController - getLectureDates', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockGetLectureDatesBySemester.mockClear();
  });

  describe('getLectureDates', () => {
    it('should return ordered lecture dates with session_order', async () => {
      req.params = { semester: '1131' };

      const mockDates = [
        { semester: '1131', actual_date: '2024-10-15', is_active: false },
        { semester: '1131', actual_date: '2024-10-22', is_active: true }
      ];

      mockGetLectureDatesBySemester.mockResolvedValueOnce(mockDates);

      await SessionController.getLectureDates(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { ...mockDates[0], session_order: 1 },
        { ...mockDates[1], session_order: 2 }
      ]);
    });

    it('should return 400 if semester param is missing', async () => {
      req.params = {};

      await SessionController.getLectureDates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'semester parameter is required' });
    });

    it('should return 500 if model throws unexpected error', async () => {
      req.params = { semester: '1131' };
      const error = new Error('Unexpected DB error');
      mockGetLectureDatesBySemester.mockRejectedValueOnce(error);

      await SessionController.getLectureDates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - getDiscussionDates', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockGetDiscussionDatesBySemester.mockClear();
  });

  describe('getDiscussionDates', () => {
    it('should return ordered discussion dates with session_order', async () => {
      req.params = { semester: '1131' };
      const mockDates = [
        { semester: '1131', actual_date: '2024-10-16', is_active: false },
        { semester: '1131', actual_date: '2024-10-23', is_active: true }
      ];

      mockGetDiscussionDatesBySemester.mockResolvedValueOnce(mockDates);

      await SessionController.getDiscussionDates(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { ...mockDates[0], session_order: 1 },
        { ...mockDates[1], session_order: 2 }
      ]);
    });

    it('should return 400 if semester param is missing', async () => {
      req.params = {};

      await SessionController.getDiscussionDates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'semester parameter is required' });
    });

    it('should return 500 if model throws unexpected error', async () => {
      req.params = { semester: '1131' };
      const error = new Error('Unexpected DB error');
      mockGetDiscussionDatesBySemester.mockRejectedValueOnce(error);

      await SessionController.getDiscussionDates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - updateLectureDate', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockUpdateLectureDate.mockClear();
  });

  describe('updateLectureDate', () => {
    it('should update lecture date successfully', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-15' };
      req.body = { actualDate: '2024-10-22' };

      const mockUpdated = { semester: '1131', actual_date: '2024-10-22', is_active: false };

      mockUpdateLectureDate.mockResolvedValueOnce(mockUpdated);

      await SessionController.updateLectureDate(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 404 if not found', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-99' };
      req.body = { actualDate: '2024-10-22' };

      mockUpdateLectureDate.mockResolvedValueOnce(undefined);

      await SessionController.updateLectureDate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lecture date not found' });
    });

    it('should return 400 if actualDate missing', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-15' };

      req.body = {};

      await SessionController.updateLectureDate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'actualDate is required' });
    });

    it('should return 500 if model throws error', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-15' };
      req.body = { actualDate: '2024-10-22' };

      const error = new Error('Unexpected DB error');

      mockUpdateLectureDate.mockRejectedValueOnce(error);

      await SessionController.updateLectureDate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - updateDiscussionDate', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockUpdateDiscussionDate.mockClear();
  });

  describe('updateDiscussionDate', () => {
    it('should update discussion date successfully', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-16' };
      req.body = { actualDate: '2024-10-23' };

      const mockUpdated = { semester: '1131', actual_date: '2024-10-23', is_active: false };

      mockUpdateDiscussionDate.mockResolvedValueOnce(mockUpdated);

      await SessionController.updateDiscussionDate(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 404 if not found', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-99' };
      req.body = { actualDate: '2024-10-23' };

      mockUpdateDiscussionDate.mockResolvedValueOnce(undefined);

      await SessionController.updateDiscussionDate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Discussion date not found' });
    });

    it('should return 400 if actualDate missing', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-16' };
      req.body = {};

      await SessionController.updateDiscussionDate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'actualDate is required' });
    });

    it('should return 500 if model throws error', async () => {
      req.params = { semester: '1131', oldDate: '2024-10-16' };
      req.body = { actualDate: '2024-10-23' };

      const error = new Error('Unexpected DB error');

      mockUpdateDiscussionDate.mockRejectedValueOnce(error);

      await SessionController.updateDiscussionDate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - deleteLectureDate', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockDeleteLectureDate.mockClear();
  });

  describe('deleteLectureDate', () => {
    it('should delete lecture date successfully', async () => {
      req.params = { semester: '1131', actualDate: '2024-10-15' };

      const mockDeleted = { semester: '1131', actual_date: '2024-10-15', is_active: false };

      mockDeleteLectureDate.mockResolvedValueOnce(mockDeleted);

      await SessionController.deleteLectureDate(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Lecture date deleted successfully', date: mockDeleted });
    });

    it('should return 404 if not found', async () => {
      req.params = { semester: '1131', actualDate: '2024-10-99' };

      mockDeleteLectureDate.mockResolvedValueOnce(undefined);

      await SessionController.deleteLectureDate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lecture date not found' });
    });

    it('should return 500 if model throws error', async () => {
      req.params = { semester: '1131', actualDate: '2024-10-15' };

      const error = new Error('Unexpected DB error');

      mockDeleteLectureDate.mockRejectedValueOnce(error);

      await SessionController.deleteLectureDate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - deleteDiscussionDate', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockDeleteDiscussionDate.mockClear();
  });

  describe('deleteDiscussionDate', () => {
    it('should delete discussion date successfully', async () => {
      req.params = { semester: '1131', actualDate: '2024-10-16' };

      const mockDeleted = { semester: '1131', actual_date: '2024-10-16', is_active: false };

      mockDeleteDiscussionDate.mockResolvedValueOnce(mockDeleted);

      await SessionController.deleteDiscussionDate(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Discussion date deleted successfully', date: mockDeleted });
    });

    it('should return 404 if not found', async () => {
      req.params = { semester: '1131', actualDate: '2024-10-99' };

      mockDeleteDiscussionDate.mockResolvedValueOnce(undefined);

      await SessionController.deleteDiscussionDate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Discussion date not found' });
    });

    it('should return 500 if model throws error', async () => {
      req.params = { semester: '1131', actualDate: '2024-10-16' };

      const error = new Error('Unexpected DB error');

      mockDeleteDiscussionDate.mockRejectedValueOnce(error);

      await SessionController.deleteDiscussionDate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - toggleLectureAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockToggleLectureAttendance.mockClear();
  });

  describe('toggleLectureAttendance', () => {
    it('should toggle lecture attendance successfully', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-15' };
      req.body = { isActive: true };

      const mockUpdated = { semester: '1131', actual_date: '2024-10-15', is_active: true };

      mockToggleLectureAttendance.mockResolvedValueOnce(mockUpdated);

      await SessionController.toggleLectureAttendance(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 400 if isActive is not boolean', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-15' };
      req.body = { isActive: 'yes' };

      await SessionController.toggleLectureAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'isActive must be a boolean value' });
    });

    it('should return 404 if not found', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-99' };
      req.body = { isActive: true };

      mockToggleLectureAttendance.mockResolvedValueOnce(undefined);

      await SessionController.toggleLectureAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lecture date not found' });
    });

    it('should return 500 if model throws error', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-15' };
      req.body = { isActive: true };

      const error = new Error('Unexpected DB error');

      mockToggleLectureAttendance.mockRejectedValueOnce(error);

      await SessionController.toggleLectureAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});

describe('SessionController - toggleDiscussionAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    mockToggleDiscussionAttendance.mockClear();
  });

  describe('toggleDiscussionAttendance', () => {
    it('should toggle discussion attendance successfully', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-16' };
      req.body = { isActive: true };

      const mockUpdated = { semester: '1131', actual_date: '2024-10-16', is_active: true };

      mockToggleDiscussionAttendance.mockResolvedValueOnce(mockUpdated);

      await SessionController.toggleDiscussionAttendance(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 400 if isActive is not boolean', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-16' };
      req.body = { isActive: 'yes' };

      await SessionController.toggleDiscussionAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'isActive must be a boolean value' });
    });

    it('should return 404 if not found', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-99' };
      req.body = { isActive: true };

      mockToggleDiscussionAttendance.mockResolvedValueOnce(undefined);

      await SessionController.toggleDiscussionAttendance(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Discussion date not found' });
    });

    it('should return 500 if model throws error', async () => {
      req.params = { semester: '1131', selectedDate: '2024-10-16' };
      req.body = { isActive: true };

      const error = new Error('Unexpected DB error');

      mockToggleDiscussionAttendance.mockRejectedValueOnce(error);

      await SessionController.toggleDiscussionAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unexpected DB error' });
    });
  });
});