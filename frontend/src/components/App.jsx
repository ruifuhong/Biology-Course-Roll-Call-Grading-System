
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterLecturer from './RegisterLecturer';
import LectureRollcall from './LectureRollcall';
import DiscussionRollcall from './DiscussionRollcall';
import AdminDashboard from './AdminDashboard';
import ForcePasswordChange from './ForcePasswordChange';
import Login from './Login';
import NotFound from './NotFound';
import '../styles/App.css';

function MainPage() {
  return (
    <div className="mainpage-container">
      <h2 className="mainpage-title">🎓 生物課點名系統 Biology Course Rollcall System</h2>
      <div className="mainpage-links">
        <a href="/lecture-rollcall" className="mainpage-link lecture">正課 Lecture Rollcall</a>
        <a href="/discussion-rollcall" className="mainpage-link discussion">討論課 Discussion Rollcall</a>
        <a href="/admin" className="mainpage-link admin">老師&助教登入 Admin Panel</a>
      </div>
    </div>
  )
}



import { useEffect } from 'react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        console.log('找不到登入者 No user found');
      }
    } catch {
      setUser(null);
      console.log('讀取登入者時發生錯誤 User fetch error');
    } finally {
      setLoadingUser(false);
    }
  };

    useEffect(() => {
    fetchUser();
    }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    fetch(`${apiBase}/api/admin/logout`, { method: 'POST', credentials: 'include' });
  };

  if (loadingUser) return <div className="loading-user">載入中... Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/lecture-rollcall" element={<LectureRollcall />} />
        <Route path="/discussion-rollcall" element={<DiscussionRollcall />} />
        <Route path="/admin" element={
          user
            ? user.mustChangePassword
              ? <ForcePasswordChange onChanged={fetchUser} />
              : <AdminDashboard user={user} onLogout={handleLogout} />
            : <Login onLogin={handleLogin} />
        } />
        <Route path="/register-lecturer" element={<RegisterLecturer />} />
        <Route path="/admin/change-password" element={<ForcePasswordChange onChanged={fetchUser} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;