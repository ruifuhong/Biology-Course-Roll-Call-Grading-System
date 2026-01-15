import { jest } from '@jest/globals';

const mockMarkLectureAttendance = jest.fn();
const mockMarkDiscussionAttendance = jest.fn();
const mockGetLectureAttendance = jest.fn();
const mockGetDiscussionAttendance = jest.fn();
const mockGetAllLectureAttendance = jest.fn();
const mockGetAllDiscussionAttendance = jest.fn();
const mockFindStudentById = jest.fn();

jest.unstable_mockModule('../../models/AttendanceModel.js', () => ({
  markLectureAttendance: mockMarkLectureAttendance,
  markDiscussionAttendance: mockMarkDiscussionAttendance,
  getLectureAttendance: mockGetLectureAttendance,
  getDiscussionAttendance: mockGetDiscussionAttendance,
  getAllLectureAttendance: mockGetAllLectureAttendance,
  getAllDiscussionAttendance: mockGetAllDiscussionAttendance
}));

jest.unstable_mockModule('../../models/StudentModel.js', () => ({
  findStudentById: mockFindStudentById
}));

const AttendanceController = await import('../../controllers/AttendanceController.js');

describe('AttendanceController - submitLectureAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.clearAllMocks();

    mockMarkLectureAttendance.mockClear();
    mockFindStudentById.mockClear();
  });

  it('should record attendance with valid data', async () => {
    req.body = { semester: '1131', studentId: 'B100000001', actual_date: '2024-10-15', status: 'present' };

    const mockStudent = { student_id: 'B100000001', name: 'Alice' };
    const mockAttendance = { semester: '1131', studentId: 'B100000001', actual_date: '2024-10-15', status: 'present' };

    mockFindStudentById.mockResolvedValueOnce(mockStudent);
    mockMarkLectureAttendance.mockResolvedValueOnce(mockAttendance);

    await AttendanceController.submitLectureAttendance(req, res);

    expect(mockFindStudentById).toHaveBeenCalledWith('1131', 'B100000001');
    expect(mockMarkLectureAttendance).toHaveBeenCalledWith('1131', 'B100000001', '2024-10-15', 'present');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: '正課出席紀錄成功 Lecture attendance recorded successfully',
      attendance: mockAttendance,
      student: { student_id: 'B100000001', name: 'Alice' }
    });
  });

  it('should return 400 if required fields are missing', async () => {
    req.body = { studentId: 'B100000001', actual_date: '2024-10-15' };

    await AttendanceController.submitLectureAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: '缺少學期、學號或日期 Semester, student ID, and actual_date are required' });
    expect(mockFindStudentById).not.toHaveBeenCalled();
  });

  it('should return 404 if student not found', async () => {
    req.body = { semester: '1131', studentId: 'S999', actual_date: '2024-10-15', status: 'present' };

    mockFindStudentById.mockResolvedValueOnce(undefined);

    await AttendanceController.submitLectureAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: '查無此學生 Student not found' });
  });

  it('should handle model/database errors', async () => {
    req.body = { semester: '1131', studentId: 'B100000001', actual_date: '2024-10-15', status: 'present' };

    mockFindStudentById.mockRejectedValueOnce(new Error('DB error'));

    await AttendanceController.submitLectureAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '提交正課出席失敗 Failed to submit lecture attendance', details: 'DB error' });
  });
});

describe('AttendanceController - submitDiscussionAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.clearAllMocks();

    mockMarkDiscussionAttendance.mockClear();
    mockFindStudentById.mockClear();
  });

  it('should record attendance with valid data', async () => {
    req.body = { semester: '1131', studentId: 'B100000001', actual_date: '2024-10-16', status: 'present' };

    const mockStudent = { student_id: 'B100000001', name: 'Alice' };
    const mockAttendance = { semester: '1131', studentId: 'B100000001', actual_date: '2024-10-16', status: 'present' };

    mockFindStudentById.mockResolvedValueOnce(mockStudent);
    mockMarkDiscussionAttendance.mockResolvedValueOnce(mockAttendance);

    await AttendanceController.submitDiscussionAttendance(req, res);

    expect(mockFindStudentById).toHaveBeenCalledWith('1131', 'B100000001');
    expect(mockMarkDiscussionAttendance).toHaveBeenCalledWith('1131', 'B100000001', '2024-10-16', 'present');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: '討論課出席紀錄成功 Discussion attendance recorded successfully',
      attendance: mockAttendance,
      student: { student_id: 'B100000001', name: 'Alice' }
    });
  });

  it('should return 400 if required fields are missing', async () => {
    req.body = { studentId: 'B100000001', actual_date: '2024-10-16' };

    await AttendanceController.submitDiscussionAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: '缺少學期、學號或日期 Semester, student ID, and actual_date are required' });
    expect(mockFindStudentById).not.toHaveBeenCalled();
  });

  it('should return 404 if student not found', async () => {
    req.body = { semester: '1131', studentId: 'S999', actual_date: '2024-10-16', status: 'present' };

    mockFindStudentById.mockResolvedValueOnce(undefined);

    await AttendanceController.submitDiscussionAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: '查無此學生 Student not found' });
  });

  it('should handle model/database errors', async () => {
    req.body = { semester: '1131', studentId: 'B100000001', actual_date: '2024-10-16', status: 'present' };

    mockFindStudentById.mockRejectedValueOnce(new Error('DB error'));

    await AttendanceController.submitDiscussionAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '提交討論課出席失敗 Failed to submit discussion attendance', details: 'DB error' });
  });
});

describe('AttendanceController - getStudentLectureAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.clearAllMocks();
    
    mockGetLectureAttendance.mockClear();
  });

  it('should return attendance for a student', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    const mockAttendance = { present: 10, absent: 2 };

    mockGetLectureAttendance.mockResolvedValueOnce(mockAttendance);

    await AttendanceController.getStudentLectureAttendance(req, res);

    expect(mockGetLectureAttendance).toHaveBeenCalledWith('1131', 'B100000001');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttendance);
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    mockGetLectureAttendance.mockRejectedValueOnce(new Error('DB error'));

    await AttendanceController.getStudentLectureAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '取得正課出席失敗 Failed to get student lecture attendance' });
  });
});

describe('AttendanceController - getStudentDiscussionAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.clearAllMocks();

    mockGetDiscussionAttendance.mockClear();
  });

  it('should return attendance for a student', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    const mockAttendance = { present: 8, absent: 4 };

    mockGetDiscussionAttendance.mockResolvedValueOnce(mockAttendance);

    await AttendanceController.getStudentDiscussionAttendance(req, res);

    expect(mockGetDiscussionAttendance).toHaveBeenCalledWith('1131', 'B100000001');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttendance);
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131', studentId: 'B100000001' };

    mockGetDiscussionAttendance.mockRejectedValueOnce(new Error('DB error'));

    await AttendanceController.getStudentDiscussionAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '取得討論課出席失敗 Failed to get student discussion attendance' });
  });
});

describe('AttendanceController - getAllLectureAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.clearAllMocks();

    mockGetAllLectureAttendance.mockClear();
  });

  it('should return all lecture attendance for a semester', async () => {
    req.params = { semester: '1131' };

    const mockAttendance = [
      { studentId: 'B100000001', present: 10, absent: 2 },
      { studentId: 'S002', present: 9, absent: 3 }
    ];

    mockGetAllLectureAttendance.mockResolvedValueOnce(mockAttendance);

    await AttendanceController.getAllLectureAttendance(req, res);

    expect(mockGetAllLectureAttendance).toHaveBeenCalledWith('1131');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttendance);
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131' };

    mockGetAllLectureAttendance.mockRejectedValueOnce(new Error('DB error'));

    await AttendanceController.getAllLectureAttendance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '取得所有正課出席失敗 Failed to get all lecture attendance' });
  });
});

describe('AttendanceController - getAllDiscussionAttendance', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jest.clearAllMocks();

    mockGetAllDiscussionAttendance.mockClear();
  });

  it('should return all discussion attendance for a semester', async () => {
    req.params = { semester: '1131' };

    const mockAttendance = [
      { studentId: 'B100000001', present: 8, absent: 4 },
      { studentId: 'S002', present: 7, absent: 5 }
    ];

    mockGetAllDiscussionAttendance.mockResolvedValueOnce(mockAttendance);

    await AttendanceController.getAllDiscussionAttendance(req, res);

    expect(mockGetAllDiscussionAttendance).toHaveBeenCalledWith('1131');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttendance);
  });

  it('should handle model/database errors', async () => {
    req.params = { semester: '1131' };

    mockGetAllDiscussionAttendance.mockRejectedValueOnce(new Error('DB error'));

    await AttendanceController.getAllDiscussionAttendance(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '取得所有討論課出席失敗 Failed to get all discussion attendance' });
  });
});
