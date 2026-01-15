import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockRegisterLecturer = jest.fn();
const mockGetMe = jest.fn();
const mockGetAllTADetails = jest.fn();
const mockAddTA = jest.fn();
const mockDeleteTA = jest.fn();
const mockUpdateTA = jest.fn();
const mockGetAllAdmins = jest.fn();
const mockGetTASemesters = jest.fn();
const mockChangePassword = jest.fn();

jest.unstable_mockModule('../../controllers/AdminUserController.js', () => ({
  login: mockLogin,
  logout: mockLogout,
  registerLecturer: mockRegisterLecturer,
  getMe: mockGetMe,
  getAllTADetails: mockGetAllTADetails,
  addTA: mockAddTA,
  deleteTA: mockDeleteTA,
  updateTA: mockUpdateTA,
  getAllAdmins: mockGetAllAdmins,
  getTASemesters: mockGetTASemesters,
  changePassword: mockChangePassword
}));

const adminRoutes = (await import('../../routes/admin.js')).default;

function getApp(cookie) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/admin', adminRoutes);
  return app;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const validPayload = { id: 1, role: 'lecturer', username: 'admin' };
const validToken = jwt.sign(validPayload, JWT_SECRET);
const validCookie = `admin_token=${validToken}`;

describe('Admin Routes', () => {
  let app;
  beforeEach(() => {
    app = getApp();
    jest.clearAllMocks();
  });

  describe('POST /api/admin/login', () => {
    it('calls login controller', async () => {
      mockLogin.mockImplementation((req, res) => res.status(200).json({ message: 'ok' }));
      const response = await request(app).post('/api/admin/login').send({ username: 'u', password: 'p' });
      expect(response.status).toBe(200);
      expect(mockLogin).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockLogin.mockImplementation((req, res) => res.status(500).json({ error: 'Internal server error' }));
      const response = await request(app).post('/api/admin/login').send({ username: 'u', password: 'p' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /api/admin/logout', () => {
    it('calls logout controller', async () => {
      mockLogout.mockImplementation((req, res) => res.status(200).json({ message: 'logged out' }));
      const response = await request(app).post('/api/admin/logout');
      expect(response.status).toBe(200);
      expect(mockLogout).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockLogout.mockImplementation((req, res) => res.status(500).json({ error: 'Logout failed' }));
      const response = await request(app).post('/api/admin/logout');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Logout failed');
    });
  });

  describe('POST /api/admin/register-lecturer', () => {
    it('calls registerLecturer controller', async () => {
      mockRegisterLecturer.mockImplementation((req, res) => res.status(201).json({ message: 'registered' }));
      const response = await request(app).post('/api/admin/register-lecturer').send({ username: 'lect', password: 'pw' });
      expect(response.status).toBe(201);
      expect(mockRegisterLecturer).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockRegisterLecturer.mockImplementation((req, res) => res.status(500).json({ error: 'Register failed' }));
      const response = await request(app).post('/api/admin/register-lecturer').send({ username: 'lect', password: 'pw' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Register failed');
    });
  });

  describe('GET /api/admin/me', () => {
    beforeEach(() => {
      app = getApp();
    });

    it('calls getMe controller', async () => {
      mockGetMe.mockImplementation((req, res) => res.status(200).json({ user: { id: 1 } }));
      const response = await request(app)
        .get('/api/admin/me')
        .set('Cookie', validCookie);
      expect(response.status).toBe(200);
      expect(mockGetMe).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockGetMe.mockImplementation((req, res) => res.status(500).json({ error: 'GetMe failed' }));
      const response = await request(app)
        .get('/api/admin/me')
        .set('Cookie', validCookie);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('GetMe failed');
    });
  });

  describe('GET /api/admin/ta-list', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls getAllTADetails controller', async () => {
      mockGetAllTADetails.mockImplementation((req, res) => res.status(200).json({ tas: [] }));
      const response = await request(app)
        .get('/api/admin/ta-list')
        .set('Cookie', validCookie);
      expect(response.status).toBe(200);
      expect(mockGetAllTADetails).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockGetAllTADetails.mockImplementation((req, res) => res.status(500).json({ error: 'TA list failed' }));
      const response = await request(app)
        .get('/api/admin/ta-list')
        .set('Cookie', validCookie);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('TA list failed');
    });
  });

  describe('POST /api/admin/add-ta', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls addTA controller', async () => {
      mockAddTA.mockImplementation((req, res) => res.status(201).json({ ta: { id: 2 } }));
      const response = await request(app)
        .post('/api/admin/add-ta')
        .set('Cookie', validCookie)
        .send({ username: 'ta', password: 'pw', name: 'TA', semesters: ['1131'] });
      expect(response.status).toBe(201);
      expect(mockAddTA).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockAddTA.mockImplementation((req, res) => res.status(500).json({ error: 'Add TA failed' }));
      const response = await request(app)
        .post('/api/admin/add-ta')
        .set('Cookie', validCookie)
        .send({ username: 'ta', password: 'pw', name: 'TA', semesters: ['1131'] });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Add TA failed');
    });
  });

  describe('DELETE /api/admin/remove-ta/:id', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls deleteTA controller', async () => {
      mockDeleteTA.mockImplementation((req, res) => res.status(200).json({ message: 'deleted' }));
      const response = await request(app)
        .delete('/api/admin/remove-ta/2')
        .set('Cookie', validCookie);
      expect(response.status).toBe(200);
      expect(mockDeleteTA).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockDeleteTA.mockImplementation((req, res) => res.status(500).json({ error: 'Delete TA failed' }));
      const response = await request(app)
        .delete('/api/admin/remove-ta/2')
        .set('Cookie', validCookie);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Delete TA failed');
    });
  });

  describe('PUT /api/admin/update-ta/:id', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls updateTA controller', async () => {
      mockUpdateTA.mockImplementation((req, res) => res.status(200).json({ ta: { id: 2 } }));
      const response = await request(app)
        .put('/api/admin/update-ta/2')
        .set('Cookie', validCookie)
        .send({ name: 'TA2', username: 'ta2', semesters: ['1132'] });
      expect(response.status).toBe(200);
      expect(mockUpdateTA).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockUpdateTA.mockImplementation((req, res) => res.status(500).json({ error: 'Update TA failed' }));
      const response = await request(app)
        .put('/api/admin/update-ta/2')
        .set('Cookie', validCookie)
        .send({ name: 'TA2', username: 'ta2', semesters: ['1132'] });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Update TA failed');
    });
  });

  describe('GET /api/admin/users', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls getAllAdmins controller', async () => {
      mockGetAllAdmins.mockImplementation((req, res) => res.status(200).json({ users: [] }));
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', validCookie);
      expect(response.status).toBe(200);
      expect(mockGetAllAdmins).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockGetAllAdmins.mockImplementation((req, res) => res.status(500).json({ error: 'Get admins failed' }));
      const response = await request(app)
        .get('/api/admin/users')
        .set('Cookie', validCookie);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Get admins failed');
    });
  });

  describe('GET /api/admin/ta-semesters/:taId', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls getTASemesters controller', async () => {
      mockGetTASemesters.mockImplementation((req, res) => res.status(200).json({ semesters: [] }));
      const response = await request(app)
        .get('/api/admin/ta-semesters/2')
        .set('Cookie', validCookie);
      expect(response.status).toBe(200);
      expect(mockGetTASemesters).toHaveBeenCalled();
    });

    it('returns 500 on server error', async () => {
      mockGetTASemesters.mockImplementation((req, res) => res.status(500).json({ error: 'Get semesters failed' }));
      const response = await request(app)
        .get('/api/admin/ta-semesters/2')
        .set('Cookie', validCookie);
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Get semesters failed');
    });
  });

  describe('POST /api/admin/change-password', () => {
    beforeEach(() => {
        app = getApp();
    });

    it('calls changePassword controller', async () => {
      mockChangePassword.mockImplementation((req, res) => res.status(200).json({ message: 'changed' }));
      const response = await request(app)
        .post('/api/admin/change-password')
        .set('Cookie', validCookie)
        .send({ oldPassword: 'old', newPassword: 'new' });
      expect(response.status).toBe(200);
      expect(mockChangePassword).toHaveBeenCalled();
    });
    
    it('returns 500 on server error', async () => {
      mockChangePassword.mockImplementation((req, res) => res.status(500).json({ error: 'Change password failed' }));
      const response = await request(app)
        .post('/api/admin/change-password')
        .set('Cookie', validCookie)
        .send({ oldPassword: 'old', newPassword: 'new' });
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Change password failed');
    });
  });
});
