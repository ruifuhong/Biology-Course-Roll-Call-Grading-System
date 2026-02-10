import * as AdminUserModel from '../models/AdminUserModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const COOKIE_NAME = 'admin_token';

const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
};

export async function getMe(req, res) {
  if (!req.user) return res.status(401).json({ error: '無權限 Not authenticated' });
  const { id, role } = req.user;
  let userInfo = { id, role };
  try {
    if (role === 'lecturer') {
    const info = await AdminUserModel.getLecturerInfoById(id);
    userInfo.username = info.username;
    userInfo.name = info.name || info.username;
  } else if (role === 'ta') {
      const info = await AdminUserModel.getTAInfoById(id);
      userInfo.username = info.username;
      userInfo.name = info.name;
      const semesters = await AdminUserModel.getTASemesters(id);
      userInfo.assignedSemesters = semesters;
    }
    res.json({ user: userInfo });
  } catch (err) {
     console.error('抓取使用者資訊失敗 Failed to fetch user info:', err);
     res.status(500).json({ error: '抓取使用者資訊失敗 Failed to fetch user info' });
  }
}

export async function getTASemesters(req, res) {
  const { taId } = req.params;
  try {
    const semesters = await AdminUserModel.getTASemesters(taId);
    res.json({ semesters });
  } catch (err) {
     console.error('抓取助教學期資訊失敗 Failed to fetch TA semesters:', err);
     res.status(500).json({ error: '抓取助教學期資訊失敗 Failed to fetch TA semesters' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await AdminUserModel.findUserByUsername(username);
    if (!user) {
      console.warn('登入失敗：無此帳號 Login failed: Invalid credentials');
      return res.status(401).json({ error: '無此帳號 Invalid credentials' });
    }
    const valid = await AdminUserModel.verifyPassword(user, password);
    if (!valid) {
      console.warn('登入失敗：密碼錯誤 Login failed: Invalid credentials');
      return res.status(401).json({ error: '密碼錯誤 Invalid credentials' });
    }
    let userInfo = { id: user.id, username: user.username, role: user.role, mustChangePassword: false };
    if (user.role === 'ta') {
      const name = await AdminUserModel.getTANameById(user.id);
      userInfo.name = name || user.username;
      const semesters = await AdminUserModel.getTASemesters(user.id);
      userInfo.assignedSemesters = semesters;
      // Check if password is default (username+username)
      const isDefault = await AdminUserModel.verifyPassword(user, user.username + user.username);
      userInfo.mustChangePassword = !!isDefault;
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ user: userInfo });
  } catch (err) {
    console.error('登入失敗 Login failed:', err);
    res.status(500).json({ error: '登入失敗 Login failed' });
  }
}

export function logout(req, res) {
  try {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    res.json({ message: '已登出 Logged out' });
  } catch (err) {
    console.error('登出失敗 Logout failed:', err);
    res.status(500).json({ error: '登出失敗 Logout failed' });
  }
}

export async function registerLecturer(req, res) {
  try {
    const { username, password } = req.body;
    const user = await AdminUserModel.createUser({ username, password, role: 'lecturer' });
    if (!user) return res.status(400).json({ error: '此帳號已註冊 Username already exists' });
    res.status(201).json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('註冊講師失敗 Register lecturer failed:', err);
    res.status(500).json({ error: '註冊講師失敗 Register lecturer failed' });
  }
}

export async function addTA(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: '無權限操作 Forbidden' });
  const { username, password, name, semesters } = req.body;
  const user = await AdminUserModel.createUser({ username, password, role: 'ta' });
  if (!user) return res.status(400).json({ error: '此帳號已註冊 Username already exists' });
  try {
    await AdminUserModel.addTAName({ ta_id: user.id, name });
  } catch (err) {
    console.error('儲存助教名字失敗 Failed to save TA name:', err);
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
      console.error('設定助教學期失敗 Failed to assign semesters:', err);
      return res.status(500).json({ error: '設定學期失敗 Failed to assign semesters' });
    }
  }
  res.status(201).json({ user: { id: user.id, username: user.username, name, role: user.role, semesters } });
}

export async function deleteTA(req, res) {
  try {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({ error: '無權限操作 Forbidden' });
    }
    
    const { id } = req.params;

    const isDeleted = await AdminUserModel.deleteAnyUserById(id);

    if (!isDeleted) {
      return res.status(404).json({ error: '查無此助教 TA not found' });
    }

    res.json({ message: '助教刪除成功 TA deleted successfully' });
  } catch (err) {
    console.error('刪除助教 Controller 失敗:', err);
    res.status(500).json({ error: '刪除助教失敗 Delete TA failed' });
  }
}

export async function updateTA(req, res) {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: '無權限操作' });
  
  const { id } = req.params;
  const { name, username, semesters } = req.body;

  try {
    const ta = await AdminUserModel.findAnyUserById(id);
    if (!ta || ta.role !== 'ta') return res.status(404).json({ error: '查無此助教' });

    if (ta.provider === 'google') {
      if (Array.isArray(semesters)) {
        await AdminUserModel.setTASemesters(id, semesters, 'google');
      }
    } else {
      if (username && username !== ta.username) {
        await AdminUserModel.updateTAUsername(id, username);
      }
      if (name) {
        await AdminUserModel.updateTAName({ ta_id: id, name });
      }
      if (Array.isArray(semesters)) {
        await AdminUserModel.setTASemesters(id, semesters, 'legacy');
      }
    }
    const updatedTA = await AdminUserModel.findAnyUserById(id);
    res.json({ ta: updatedTA });

  } catch (err) {
    console.error('更新助教失敗:', err);
    res.status(500).json({ error: '更新失敗' });
  }
}

export async function getAllTADetails(req, res) {
  try {
    if (req.user.role !== 'lecturer') return res.status(403).json({ error: '無權限操作 Forbidden' });
    const tas = await AdminUserModel.getAllTADetails();
    res.json({ tas });
  } catch (err) {
    console.error('取得所有助教資料失敗 Get all TA details failed:', err);
    res.status(500).json({ error: '取得所有助教資料失敗 Get all TA details failed' });
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
      console.error('更改密碼失敗 Failed to change password:', err);
      res.status(500).json({ error: '更新密碼失敗 Failed to change password' });
  }
}
