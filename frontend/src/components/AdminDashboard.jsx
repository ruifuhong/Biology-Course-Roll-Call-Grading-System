import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentManagement from './StudentManagement';
import SessionManagement from './SessionManagement';
import RegisterTA from './RegisterTA';
import { generateSemesterOptions } from '../utils/semesterUtils';
import '../styles/AdminDashboard.css';

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');

  const allSemesterOptions = generateSemesterOptions();
  const semesterOptions = user?.role === 'ta'
    ? allSemesterOptions.filter(opt => user.assignedSemesters?.includes(opt.value))
    : allSemesterOptions;
  const [currentSemester, setCurrentSemester] = useState(semesterOptions[0]?.value || '1131');

  const tabs = [
    { id: 'students', label: '學生管理 Student Management', component: StudentManagement },
    { id: 'sessions', label: '課程日期 Session Dates', component: SessionManagement },
    ...(user?.role === 'lecturer' ? [
      { id: 'register-ta', label: '助教管理 TA Management', component: RegisterTA }
    ] : [])
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <h1>管理面板 Admin Dashboard</h1>
        <div className="admin-header-user">
          <span>您好！Hi! <br /> <b>{user?.name || user?.username}</b></span>
          <button
            className="change-password-btn"
            onClick={() => navigate('/admin/change-password')}
          >
            更改密碼 Change Password
          </button>
          <button onClick={onLogout}>登出 Logout</button>
        </div>
      </div>
      <div className="semester-selector">
        <label>
          <strong>學期 Semester </strong>
          <select 
            value={currentSemester} 
            onChange={(e) => setCurrentSemester(e.target.value)}
          >
            {semesterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {ActiveComponent && (
          <ActiveComponent 
            semester={currentSemester}
            onSemesterChange={setCurrentSemester}
          />
        )}
      </div>
    </div>
  );
}