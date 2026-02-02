import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import '../styles/Login.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send httpOnly cookie
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin && onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'popup', 
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBase}/api/admin/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', 
          body: JSON.stringify({ code: codeResponse.code }) 
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("伺服器回傳格式錯誤");
        }

        const data = await response.json();

        if (response.ok) {
          try {
            const meRes = await fetch(`${apiBase}/api/admin/me`, { credentials: 'include' });
            const meData = await meRes.json();
            if (meRes.ok && meData.user) {
              localStorage.setItem('user', JSON.stringify(meData.user));
              if (onLogin) onLogin(meData.user);
            } else {
              localStorage.setItem('user', JSON.stringify(data.user));
              if (onLogin) onLogin(data.user);
            }
          } catch (err) {
            localStorage.setItem('user', JSON.stringify(data.user));
            if (onLogin) onLogin(data.user);
          }
        } else {
          setError(data.error || 'Google 驗證失敗');
        }
      } catch (err) {
        console.error('Login Fetch Error:', err);
        setError('伺服器連線異常，請檢查後端是否啟動');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google Login Error:', errorResponse);
      setError('Google 登入取消或失敗');
      setLoading(false);
    }
  });

  return (
    <div className="login-container">
      <h2>老師／助教登入 Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>帳號 Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="使用者名稱 Username" />
        </div>
        <div>
          <label>密碼 Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="密碼 Password" />
        </div>
        {error && <div className="error">錯誤 {error}</div>}
        <button type="submit" disabled={loading}>{loading ? '登入中... Logging in...' : '登入 Login'}</button>
      </form>
      <div className="google-login-btn-container">
        <button 
          className="google-login-standard-btn" 
          onClick={() => {
            setLoading(true);
            googleLogin();
          }} 
          disabled={loading}
          type="button"
        >
          <div className="google-icon-wrapper">
            <img 
              className="google-icon" 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="Google logo" 
            />
          </div>
          <span className="google-btn-text">
            {loading ? '驗證中...' : '使用 Google 帳號登入'}
          </span>
        </button>
      </div>
      <button className="mainpage-link-btn" onClick={() => navigate('/')}>回首頁 Go to Main Page</button>
    </div>
  );
}
