import * as AdminUserModel from '../models/AdminUserModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const COOKIE_NAME = 'admin_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1 * 24 * 60 * 60 * 1000 //1 day
};

export async function getMe(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { id, role } = req.user;
  let userInfo = { id, role };
  try {
    if (role === 'lecturer') {
      const info = await AdminUserModel.getLecturerInfoById(id);
      userInfo.username = info.username;
    } else if (role === 'ta') {
      const info = await AdminUserModel.getTAInfoById(id);
      userInfo.username = info.username;
      userInfo.name = info.name;
      const semesters = await AdminUserModel.getTASemesters(id);
      userInfo.assignedSemesters = semesters;
    }
    res.json({ user: userInfo });
  } catch (err) {
    res.status(500).json({ error: '抓取使用者資訊失敗 Failed to fetch user info' });
  }
}

export async function getTASemesters(req, res) {
  const { taId } = req.params;
  try {
    const semesters = await AdminUserModel.getTASemesters(taId);
    res.json({ semesters });
  } catch (err) {
    res.status(500).json({ error: '抓取助教學期資訊失敗 Failed to fetch TA semesters' });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await AdminUserModel.findUserByUsername(username);
  if (!user) return res.status(401).json({ error: '無此帳號 Invalid credentials' });
  const valid = await AdminUserModel.verifyPassword(user, password);
  if (!valid) return res.status(401).json({ error: '密碼錯誤 Invalid credentials' });
  let userInfo = { id: user.id, username: user.username, role: user.role, mustChangePassword: false };

  if (user.role === 'ta') {
    const name = await AdminUserModel.getTANameById(user.id);
    userInfo.name = name || user.username;

    const semesters = await AdminUserModel.getTASemesters(user.id);
    userInfo.assignedSemesters = semesters;

    // Check if password is default (username+username)
    const isDefault = await AdminUserModel.verifyPassword(user, user.username + user.username);
    userInfo.mustChangePassword = !!isDefault; // Always set to boolean value
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ user: userInfo });
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.json({ message: '已登出 Logged out' });
}

export async function registerLecturer(req, res) {
  const { username, password } = req.body;
  const user = await AdminUserModel.createUser({ username, password, role: 'lecturer' });
  if (!user) return res.status(400).json({ error: '此帳號已註冊 Username already exists' });
  res.status(201).json({ user: { id: user.id, username: user.username, role: user.role } });
}

export async function addTA(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Forbidden' });
  const { username, password, name, semesters } = req.body;
  const user = await AdminUserModel.createUser({ username, password, role: 'ta' });
  if (!user) return res.status(400).json({ error: '此帳號已註冊 Username already exists' });
  
 try {
    await AdminUserModel.addTAName({ ta_id: user.id, username, name });
  } catch (err) {
    return res.status(500).json({ error: '存取助教名字失敗 Failed to save TA name' });
  }

  if (Array.isArray(semesters) && semesters.length > 0) {
    try {
      await Promise.all(
        semesters.map(semester =>
          AdminUserModel.addTASemester({ ta_id: user.id, semester })
        )
      );
    } catch (err) {
      return res.status(500).json({ error: '設定學期失敗 Failed to assign semesters' });
    }
  }
  res.status(201).json({ user: { id: user.id, username: user.username, name, role: user.role, semesters } });
}

export async function deleteTA(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const ta = await AdminUserModel.findUserById(id);
  if (!ta || ta.role !== 'ta') return res.status(404).json({ error: '查無此助教 TA not found' });
  await AdminUserModel.deleteTANames(id);
  await AdminUserModel.deleteTASemesters(id);
  await AdminUserModel.deleteUser(id);
  res.json({ message: '助教刪除成功 TA deleted' });
}

export async function getAllAdmins(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Forbidden' });
  const users = await AdminUserModel.getAllUsers();
  res.json({ users: users.map(u => ({ id: u.id, username: u.username, role: u.role })) });
}

export async function getAllTADetails(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Forbidden' });
  const tas = await AdminUserModel.getAllTADetails();
  res.json({ tas });
}

export async function updateTA(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const { name, username, semesters } = req.body;
  
  const ta = await AdminUserModel.findUserById(id);
  if (!ta || ta.role !== 'ta') return res.status(404).json({ error: '查無此助教 TA not found' });
  try {
    if (username && username !== ta.username) {
      await AdminUserModel.updateTAUsername(id, username);
    }

    if (name) {
      await AdminUserModel.updateTAName({ta_id: id, username, name});
    }

    if (Array.isArray(semesters)) {
      await AdminUserModel.setTASemesters(id, semesters);
    }

    const updatedTA = await AdminUserModel.findUserById(id);
    res.json({ ta: updatedTA });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function changePassword(req, res) {
  if (!req.user) return res.status(401).json({ error: '未登入 Not authenticated' });
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '新舊密碼皆須填寫 Both oldPassword and newPassword are required' });
  }
  try {
    const user = await AdminUserModel.findUserById(req.user.id);
    const valid = await AdminUserModel.verifyPassword(user, oldPassword);
    if (!valid) return res.status(401).json({ error: '舊密碼錯誤 Old password is incorrect' });
    await AdminUserModel.updateUserPassword(req.user.id, newPassword);
    res.json({ message: '更新密碼成功 Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: '更新密碼失敗 Failed to change password' });
  }
}
