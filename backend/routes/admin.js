import express from 'express';
import * as AdminUserController from '../controllers/AdminUserController.js';
import * as GoogleLoginController from '../controllers/AuthController.js';
import jwt from 'jsonwebtoken';


const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const COOKIE_NAME = 'admin_token';

// Middleware to authenticate JWT from httpOnly cookie
function authenticateJWT(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.post('/login', AdminUserController.login);
router.post('/logout', AdminUserController.logout);
router.post('/register-lecturer', AdminUserController.registerLecturer);
router.post('/google-login', GoogleLoginController.googleLogin);

// All routes below require authentication
router.use(authenticateJWT);

router.get('/me', AdminUserController.getMe);

router.get('/ta-list', AdminUserController.getAllTADetails);
router.post('/add-ta', AdminUserController.addTA);
router.delete('/remove-ta/:id', AdminUserController.deleteTA);
router.put('/update-ta/:id', AdminUserController.updateTA);
router.get('/users', AdminUserController.getAllAdmins);

router.post('/add-google-ta', GoogleLoginController.addGoogleTA);

router.get('/ta-semesters/:taId', AdminUserController.getTASemesters);

router.post('/change-password', AdminUserController.changePassword);

export default router;
