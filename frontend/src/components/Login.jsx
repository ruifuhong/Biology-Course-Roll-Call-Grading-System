import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className="login-container">
      <h2>老師／助教登入 Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>帳號 Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="Username / 使用者名稱" />
        </div>
        <div>
          <label>密碼 Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password / 密碼" />
        </div>
        {error && <div className="error">{error} / 錯誤</div>}
        <button type="submit" disabled={loading}>{loading ? 'Logging in... / 登入中...' : 'Login / 登入'}</button>
      </form>
      <button className="mainpage-link-btn" onClick={() => navigate('/')}
        style={{ marginTop: '18px', background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}
      >
        回首頁 Go to Main Page
      </button>
    </div>
  );
}
