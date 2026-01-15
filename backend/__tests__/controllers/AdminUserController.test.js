import { jest } from '@jest/globals';

const mockGetLecturerInfoById = jest.fn();
const mockGetTAInfoById = jest.fn();
const mockGetTASemesters = jest.fn();
const mockFindUserByUsername = jest.fn();
const mockVerifyPassword = jest.fn();
const mockCreateUser = jest.fn();
const mockAddTAName = jest.fn();
const mockAddTASemester = jest.fn();
const mockFindUserById = jest.fn();
const mockDeleteTANames = jest.fn();
const mockDeleteTASemesters = jest.fn();
const mockDeleteUser = jest.fn();
const mockGetAllUsers = jest.fn();
const mockGetAllTADetails = jest.fn();
const mockUpdateTAUsername = jest.fn();
const mockUpdateTAName = jest.fn();
const mockSetTASemesters = jest.fn();
const mockUpdateUserPassword = jest.fn();
const mockGetTANameById = jest.fn();

jest.unstable_mockModule('../../models/AdminUserModel.js', () => ({
  getLecturerInfoById: mockGetLecturerInfoById,
  getTAInfoById: mockGetTAInfoById,
  getTASemesters: mockGetTASemesters,
  findUserByUsername: mockFindUserByUsername,
  verifyPassword: mockVerifyPassword,
  createUser: mockCreateUser,
  addTAName: mockAddTAName,
  addTASemester: mockAddTASemester,
  findUserById: mockFindUserById,
  deleteTANames: mockDeleteTANames,
  deleteTASemesters: mockDeleteTASemesters,
  deleteUser: mockDeleteUser,
  getAllUsers: mockGetAllUsers,
  getAllTADetails: mockGetAllTADetails,
  updateTAUsername: mockUpdateTAUsername,
  updateTAName: mockUpdateTAName,
  setTASemesters: mockSetTASemesters,
  updateUserPassword: mockUpdateUserPassword,
  getTANameById: mockGetTANameById
}));

const AdminUserController = await import('../../controllers/AdminUserController.js');

describe('AdminUserController', () => {
  describe('getMe', () => {
    it('should return user info for authenticated lecturer', async () => {
      const req = { user: { id: 1, role: 'lecturer' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetLecturerInfoById.mockResolvedValueOnce({ username: 'lect1' });
      await AdminUserController.getMe(req, res);
      expect(mockGetLecturerInfoById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ user: { id: 1, role: 'lecturer', username: 'lect1' } });
    });

    it('should return user info for authenticated TA', async () => {
      const req = { user: { id: 2, role: 'ta' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetTAInfoById.mockResolvedValueOnce({ username: 'ta1', name: 'TA Name' });
      mockGetTASemesters.mockResolvedValueOnce(['1131', '1132']);
      await AdminUserController.getMe(req, res);
      expect(mockGetTAInfoById).toHaveBeenCalledWith(2);
      expect(mockGetTASemesters).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith({ user: { id: 2, role: 'ta', username: 'ta1', name: 'TA Name', assignedSemesters: ['1131', '1132'] } });
    });

    it('should return 401 if not authenticated', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: '無權限 Not authenticated' });
    });

    it('should handle model/database errors', async () => {
      const req = { user: { id: 1, role: 'lecturer' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetLecturerInfoById.mockRejectedValueOnce(new Error('DB error'));
      await AdminUserController.getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '抓取使用者資訊失敗 Failed to fetch user info' });
    });
  });

  describe('getTASemesters', () => {
    it('should return semesters for a TA', async () => {
      const req = { params: { taId: 2 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetTASemesters.mockResolvedValueOnce(['1131', '1132']);
      await AdminUserController.getTASemesters(req, res);
      expect(mockGetTASemesters).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith({ semesters: ['1131', '1132'] });
    });

    it('should handle model/database errors', async () => {
      const req = { params: { taId: 2 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetTASemesters.mockRejectedValueOnce(new Error('DB error'));
      await AdminUserController.getTASemesters(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '抓取助教學期資訊失敗 Failed to fetch TA semesters' });
    });
  });

  describe('login', () => {
    it('should call AdminUserModel.getTANameById with the TA’s user ID', async () => {
      const req = { body: { username: 'tauser', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 10, username: 'tauser', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce('TA Name');
      mockGetTASemesters.mockResolvedValueOnce(['1131', '1132']);
      mockVerifyPassword.mockResolvedValueOnce(false); // default password check
      await AdminUserController.login(req, res);
      expect(mockGetTANameById).toHaveBeenCalledWith(10);
    });

    it('should set userInfo.name to the TA’s name if available, or to username if not', async () => {
      const req = { body: { username: 'tauser', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 11, username: 'tauser', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce('TA Name');
      mockGetTASemesters.mockResolvedValueOnce(['1131']);
      mockVerifyPassword.mockResolvedValueOnce(false); // default password check
      await AdminUserController.login(req, res);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ name: 'TA Name' }) });

      // Now test fallback to username
      mockFindUserByUsername.mockResolvedValueOnce({ id: 12, username: 'tauser2', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce(undefined);
      mockGetTASemesters.mockResolvedValueOnce(['1131']);
      mockVerifyPassword.mockResolvedValueOnce(false); // default password check
      await AdminUserController.login(req, res);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ name: 'tauser2' }) });
    });

    it('should call AdminUserModel.getTASemesters with the TA’s user ID and set userInfo.assignedSemesters', async () => {
      const req = { body: { username: 'tauser', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 13, username: 'tauser', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce('TA Name');
      mockGetTASemesters.mockResolvedValueOnce(['1131', '1132']);
      mockVerifyPassword.mockResolvedValueOnce(false); // default password check
      await AdminUserController.login(req, res);
      expect(mockGetTASemesters).toHaveBeenCalledWith(13);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ assignedSemesters: ['1131', '1132'] }) });
    });

    it('should check if the password is the default (username+username) and set userInfo.mustChangePassword to true if so, false otherwise', async () => {
      const req = { body: { username: 'tauser', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 14, username: 'tauser', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce('TA Name');
      mockGetTASemesters.mockResolvedValueOnce(['1131']);
      mockVerifyPassword.mockResolvedValueOnce(true); // default password check (should be true)
      await AdminUserController.login(req, res);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ mustChangePassword: true }) });

      // Now test mustChangePassword false
      mockFindUserByUsername.mockResolvedValueOnce({ id: 15, username: 'tauser2', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce('TA Name');
      mockGetTASemesters.mockResolvedValueOnce(['1131']);
      mockVerifyPassword.mockResolvedValueOnce(false); // default password check (should be false)
      await AdminUserController.login(req, res);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ mustChangePassword: false }) });
    });

    it('should include all TA-specific fields in the returned user object', async () => {
      const req = { body: { username: 'tauser', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 16, username: 'tauser', role: 'ta' });
      mockVerifyPassword.mockResolvedValueOnce(true); // password check
      mockGetTANameById.mockResolvedValueOnce('TA Name');
      mockGetTASemesters.mockResolvedValueOnce(['1131', '1132']);
      mockVerifyPassword.mockResolvedValueOnce(true); // default password check
      await AdminUserController.login(req, res);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({
        id: 16,
        username: 'tauser',
        role: 'ta',
        name: 'TA Name',
        assignedSemesters: ['1131', '1132'],
        mustChangePassword: true
      }) });
    });

    it('should authenticate with correct credentials', async () => {
      const req = { body: { username: 'lect1', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 1, username: 'lect1', role: 'lecturer' });
      mockVerifyPassword.mockResolvedValueOnce(true);
      await AdminUserController.login(req, res);
      expect(mockFindUserByUsername).toHaveBeenCalledWith('lect1');
      expect(mockVerifyPassword).toHaveBeenCalledWith({ id: 1, username: 'lect1', role: 'lecturer' }, 'pw');
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ id: 1, username: 'lect1', role: 'lecturer' }) });
    });

    it('should reject invalid credentials (wrong username)', async () => {
      const req = { body: { username: 'nouser', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockFindUserByUsername.mockResolvedValueOnce(null);
      await AdminUserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: '無此帳號 Invalid credentials' });
    });

    it('should reject invalid credentials (wrong password)', async () => {
      const req = { body: { username: 'lect1', password: 'badpw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 1, username: 'lect1', role: 'lecturer' });
      mockVerifyPassword.mockResolvedValueOnce(false);
      await AdminUserController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: '密碼錯誤 Invalid credentials' });
    });

    it('should set cookie on success', async () => {
      const req = { body: { username: 'lect1', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), cookie: jest.fn() };
      mockFindUserByUsername.mockResolvedValueOnce({ id: 1, username: 'lect1', role: 'lecturer' });
      mockVerifyPassword.mockResolvedValueOnce(true);
      await AdminUserController.login(req, res);
      expect(res.cookie).toHaveBeenCalled();
    });

    it('should handle model/database errors', async () => {
      const req = { body: { username: 'lect1', password: 'pw' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockFindUserByUsername.mockRejectedValueOnce(new Error('DB error'));
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await AdminUserController.login(req, res);
      expect(spy).toHaveBeenCalledWith('登入失敗 Login failed:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '登入失敗 Login failed' });
      spy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should clear cookie and return logout message', () => {
      const req = {};
      const res = { clearCookie: jest.fn(), json: jest.fn() };
      AdminUserController.logout(req, res);
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: '已登出 Logged out' });
    });

    it('should handle errors and return 500', () => {
      const req = {};
      const error = new Error('fail');
      const res = {
        clearCookie: jest.fn(() => { throw error; }),
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      AdminUserController.logout(req, res);
      expect(spy).toHaveBeenCalledWith('登出失敗 Logout failed:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '登出失敗 Logout failed' });
      spy.mockRestore();
    });
  });

  describe('registerLecturer', () => {
    it('should register a new lecturer', async () => {
      const req = { body: { username: 'lect2', password: 'pw' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockCreateUser.mockResolvedValueOnce({ id: 2, username: 'lect2', role: 'lecturer' });
      await AdminUserController.registerLecturer(req, res);
      expect(mockCreateUser).toHaveBeenCalledWith({ username: 'lect2', password: 'pw', role: 'lecturer' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ user: { id: 2, username: 'lect2', role: 'lecturer' } });
    });

    it('should return 400 if username already exists', async () => {
      const req = { body: { username: 'lect2', password: 'pw' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockCreateUser.mockResolvedValueOnce(null);
      await AdminUserController.registerLecturer(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: '此帳號已註冊 Username already exists' });
    });

    it('should handle errors and return 500', async () => {
      const req = { body: { username: 'lect2', password: 'pw' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error('fail');
      mockCreateUser.mockRejectedValueOnce(error);
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await AdminUserController.registerLecturer(req, res);
      expect(spy).toHaveBeenCalledWith('註冊講師失敗 Register lecturer failed:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '註冊講師失敗 Register lecturer failed' });
      spy.mockRestore();
    });
  });

  describe('addTA', () => {
    it('should add a TA with valid data', async () => {
      const req = { user: { role: 'lecturer' }, body: { username: 'ta2', password: 'pw', name: 'TA2', semesters: ['1131'] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockCreateUser.mockResolvedValueOnce({ id: 3, username: 'ta2', role: 'ta' });
      mockAddTAName.mockResolvedValueOnce();
      mockAddTASemester.mockResolvedValueOnce();
      await AdminUserController.addTA(req, res);
      expect(mockCreateUser).toHaveBeenCalledWith({ username: 'ta2', password: 'pw', role: 'ta' });
      expect(mockAddTAName).toHaveBeenCalledWith({ ta_id: 3, name: 'TA2' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ user: expect.objectContaining({ id: 3, username: 'ta2', name: 'TA2', role: 'ta', semesters: ['1131'] }) });
    });

    it('should return 403 if not a lecturer', async () => {
      const req = { user: { role: 'ta' }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.addTA(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: '無權限操作 Forbidden' });
    });

    it('should return 400 if username already exists', async () => {
      const req = { user: { role: 'lecturer' }, body: { username: 'ta2', password: 'pw', name: 'TA2', semesters: ['1131'] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockCreateUser.mockResolvedValueOnce(null);
      await AdminUserController.addTA(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: '此帳號已註冊 Username already exists' });
    });

    it('should handle errors when saving TA name', async () => {
      const req = { user: { role: 'lecturer' }, body: { username: 'ta2', password: 'pw', name: 'TA2', semesters: ['1131'] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockCreateUser.mockResolvedValueOnce({ id: 3, username: 'ta2', role: 'ta' });
      mockAddTAName.mockRejectedValueOnce(new Error('DB error'));
      await AdminUserController.addTA(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '存取助教名字失敗 Failed to save TA name' });
    });

    it('should handle errors when assigning semesters', async () => {
      const req = { user: { role: 'lecturer' }, body: { username: 'ta2', password: 'pw', name: 'TA2', semesters: ['1131'] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockCreateUser.mockResolvedValueOnce({ id: 3, username: 'ta2', role: 'ta' });
      mockAddTAName.mockResolvedValueOnce();
      // Simulate Promise.all with one rejection
      mockAddTASemester.mockImplementationOnce(() => Promise.reject(new Error('DB error')));
      await AdminUserController.addTA(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '設定學期失敗 Failed to assign semesters' });
    });
  });

  describe('deleteTA', () => {
    it('should delete a TA by ID', async () => {
      const req = { user: { role: 'lecturer' }, params: { id: 4 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockFindUserById.mockResolvedValueOnce({ id: 4, role: 'ta' });
      mockDeleteTANames.mockResolvedValueOnce();
      mockDeleteTASemesters.mockResolvedValueOnce();
      mockDeleteUser.mockResolvedValueOnce();
      await AdminUserController.deleteTA(req, res);
      expect(mockFindUserById).toHaveBeenCalledWith(4);
      expect(mockDeleteTANames).toHaveBeenCalledWith(4);
      expect(mockDeleteTASemesters).toHaveBeenCalledWith(4);
      expect(mockDeleteUser).toHaveBeenCalledWith(4);
      expect(res.json).toHaveBeenCalledWith({ message: '助教刪除成功 TA deleted' });
    });

    it('should return 403 if not a lecturer', async () => {
      const req = { user: { role: 'ta' }, params: { id: 4 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.deleteTA(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: '無權限操作 Forbidden' });
    });

    it('should return 404 if TA not found', async () => {
      const req = { user: { role: 'lecturer' }, params: { id: 4 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockFindUserById.mockResolvedValueOnce(null);
      await AdminUserController.deleteTA(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: '查無此助教 TA not found' });
    });

    it('should handle errors and return 500', async () => {
      const req = { user: { role: 'lecturer' }, params: { id: 4 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error('fail');
      mockFindUserById.mockRejectedValueOnce(error);
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await AdminUserController.deleteTA(req, res);
      expect(spy).toHaveBeenCalledWith('刪除助教失敗 Delete TA failed:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '刪除助教失敗 Delete TA failed' });
      spy.mockRestore();
    });
  });

  describe('updateTA', () => {
    it('should update TA details', async () => {
      const req = { user: { role: 'lecturer' }, params: { id: 5 }, body: { name: 'TA5', username: 'ta5', semesters: ['1131'] } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockFindUserById.mockResolvedValueOnce({ id: 5, role: 'ta', username: 'ta4' });
      mockUpdateTAUsername.mockResolvedValueOnce();
      mockUpdateTAName.mockResolvedValueOnce();
      mockSetTASemesters.mockResolvedValueOnce();
      mockFindUserById.mockResolvedValueOnce({ id: 5, role: 'ta', username: 'ta5', name: 'TA5', semesters: ['1131'] });
      await AdminUserController.updateTA(req, res);
      expect(mockUpdateTAUsername).toHaveBeenCalledWith(5, 'ta5');
      expect(mockUpdateTAName).toHaveBeenCalledWith({ ta_id: 5, name: 'TA5' });
      expect(mockSetTASemesters).toHaveBeenCalledWith(5, ['1131']);
      expect(res.json).toHaveBeenCalledWith({ ta: expect.objectContaining({ id: 5, username: 'ta5', name: 'TA5' }) });
    });

    it('should return 403 if not a lecturer', async () => {
      const req = { user: { role: 'ta' }, params: { id: 5 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.updateTA(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: '無權限操作 Forbidden' });
    });

    it('should return 404 if TA not found', async () => {
      const req = { user: { role: 'lecturer' }, params: { id: 5 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockFindUserById.mockResolvedValueOnce(null);
      await AdminUserController.updateTA(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: '查無此助教 TA not found' });
    });

    it('should handle model/database errors', async () => {
      const req = { user: { role: 'lecturer' }, params: { id: 5 }, body: { name: 'TA5' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockFindUserById.mockResolvedValueOnce({ id: 5, role: 'ta', username: 'ta5' });
      mockUpdateTAName.mockRejectedValueOnce(new Error('DB error'));
      await AdminUserController.updateTA(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllTADetails', () => {
    it('should return all TA details with semesters', async () => {
      const req = { user: { role: 'lecturer' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetAllTADetails.mockResolvedValueOnce([
        { id: 6, username: 'ta6', name: 'TA6', semesters: ['1131', '1132'] }
      ]);
      await AdminUserController.getAllTADetails(req, res);
      expect(res.json).toHaveBeenCalledWith({
        tas: [
          { id: 6, username: 'ta6', name: 'TA6', semesters: ['1131', '1132'] }
        ]
      });
    });

    it('should return 403 if not a lecturer', async () => {
      const req = { user: { role: 'ta' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.getAllTADetails(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: '無權限操作 Forbidden' });
    });
  });

  describe('getAllAdmins', () => {
    it('should return all admin users', async () => {
      const req = { user: { role: 'lecturer' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockGetAllUsers.mockResolvedValueOnce([{ id: 7, username: 'admin1', role: 'lecturer' }]);
      await AdminUserController.getAllAdmins(req, res);
      expect(res.json).toHaveBeenCalledWith({ users: [{ id: 7, username: 'admin1', role: 'lecturer' }] });
    });

    it('should return 403 if not a lecturer', async () => {
      const req = { user: { role: 'ta' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.getAllAdmins(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: '無權限操作 Forbidden' });
    });

    it('should handle errors and return 500', async () => {
      const req = { user: { role: 'lecturer' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const error = new Error('fail');
      mockGetAllUsers.mockRejectedValueOnce(error);
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await AdminUserController.getAllAdmins(req, res);
      expect(spy).toHaveBeenCalledWith('取得所有管理員失敗 Get all admins failed:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '取得所有管理員失敗 Get all admins failed' });
      spy.mockRestore();
    });
  });

  describe('changePassword', () => {
    it('should change password with correct old password', async () => {
      const req = { user: { id: 8 }, body: { oldPassword: 'old', newPassword: 'new' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      mockFindUserById.mockResolvedValueOnce({ id: 8 });
      mockVerifyPassword.mockResolvedValueOnce(true);
      mockUpdateUserPassword.mockResolvedValueOnce();
      await AdminUserController.changePassword(req, res);
      expect(mockFindUserById).toHaveBeenCalledWith(8);
      expect(mockVerifyPassword).toHaveBeenCalledWith({ id: 8 }, 'old');
      expect(mockUpdateUserPassword).toHaveBeenCalledWith(8, 'new');
      expect(res.json).toHaveBeenCalledWith({ message: '更新密碼成功 Password changed successfully' });
    });

    it('should return 401 if not authenticated', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: '未登入 Not authenticated' });
    });

    it('should return 400 if old/new password missing', async () => {
      const req = { user: { id: 8 }, body: { oldPassword: '', newPassword: '' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await AdminUserController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: '新舊密碼皆須填寫 Both oldPassword and newPassword are required' });
    });

    it('should return 401 if old password is incorrect', async () => {
      const req = { user: { id: 8 }, body: { oldPassword: 'wrong', newPassword: 'new' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockFindUserById.mockResolvedValueOnce({ id: 8 });
      mockVerifyPassword.mockResolvedValueOnce(false);
      await AdminUserController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: '舊密碼錯誤 Old password is incorrect' });
    });
    
    it('should handle model/database errors', async () => {
      const req = { user: { id: 8 }, body: { oldPassword: 'old', newPassword: 'new' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      mockFindUserById.mockRejectedValueOnce(new Error('DB error'));
      await AdminUserController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '更新密碼失敗 Failed to change password' });
    });
  });
});