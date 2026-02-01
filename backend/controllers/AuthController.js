import { google } from 'googleapis'; // 確保有引入 google 對象
import { oauth2Client } from '../utils/googleOAuthClient.js';
import * as AuthModel from '../models/AuthModel.js';
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

export async function googleLogin(req, res) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const { tokens } = await oauth2Client.getToken({ code, redirect_uri: 'postmessage' });
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    let user = await AuthModel.findOAuthUserByEmail(userInfo.email);

    if (!user) {
      const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN; 
      
      if (allowedDomain && !userInfo.email.endsWith(`@${allowedDomain}`)) {
        console.warn(`網域不符且不在白名單: ${userInfo.email}`);
        return res.status(403).json({ error: '您的帳號尚未授權，且不屬於指定的組織網域。' });
      }

      return res.status(403).json({ error: '您的帳號尚未獲得授權，請聯繫管理員。' });
    }

    if (!user.provider_id || user.provider_id === '') {
      await AuthModel.updateOAuthUser({
        ...user,
        provider_id: userInfo.id,
        username: userInfo.name || user.username
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        provider: user.provider || 'google',
        name: userInfo.name || user.name
      } 
    });

  } catch (err) {
    console.error('Google login error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Login failed' });
  }
}