import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ForcePasswordChange.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForcePasswordChange({ onChanged }) {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('所有欄位皆須填寫 All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('兩新密碼不相符 New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('更新密碼成功 Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onChanged && onChanged();
        navigate('/admin');
      } else {
        setError(data.error || '更新密碼失敗 Failed to change password');
      }
    } catch {
      setError('網路錯誤 Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="force-password-container">
      <h2>更改密碼 Change Password</h2>
      <form className="force-password-form" onSubmit={handleSubmit}>
        <div className="force-password-field">
          <label>舊密碼 Old Password</label>
          <input
            className="force-password-input"
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
          <small className="force-password-helper">
            新建帳號者，密碼為帳號輸入兩次，如帳號為andy，密碼為andyandy<br />
            For new accounts, the default password is the username entered twice. For example, if the username is andy, the password is andyandy.
          </small>
        </div>
        <div className="force-password-field">
          <label>新密碼 New Password</label>
          <input
            className="force-password-input"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="force-password-field">
          <label>確認新密碼 Confirm New Password</label>
          <input
            className="force-password-input"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="force-password-error">{error}</div>}
        {success && <div className="force-password-success">{success}</div>}
        <button
          className="force-password-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? '密碼更新中... Password Changing...' : '更新密碼 Change Password'}
        </button>
      </form>
      <button className="mainpage-link-btn" onClick={() => navigate('/')}>
        回首頁 Go to Main Page
      </button>
    </div>
  );
}
