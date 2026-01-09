import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterLecturer.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';


export default function RegisterLecturer({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${apiBase}/api/admin/register-lecturer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('講師帳號建立成功！Lecturer account created successfully!');
        setUsername('');
        setPassword('');
        onRegister && onRegister(data.user);
      } else {
        setError(data.error || '註冊失敗 Registration failed');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-lecturer-container">
      <h2>授課教師註冊 Register Lecturer</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>帳號 Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="帳號 Username" />
        </div>
        <div>
          <label>密碼 Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="密碼 Password" />
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button type="submit" disabled={loading}>{loading ? '註冊中... Registering...' : '註冊 Register'}</button>
      </form>
      <button className="login-link-btn" onClick={() => navigate('/admin')}>
        前往登入頁面 Go to Login Page
      </button>
    </div>
  );
}