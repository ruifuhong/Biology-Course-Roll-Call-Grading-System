import { useState } from 'react';
import StudentManagement from './StudentManagement';
import SessionManagement from './SessionManagement';
import { generateSemesterOptions } from '../utils/semesterUtils';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');

  const semesterOptions = generateSemesterOptions();
  const [currentSemester, setCurrentSemester] = useState(semesterOptions[0]?.value || '1131');

  const tabs = [
    { id: 'students', label: '學生管理 / Student Management', component: StudentManagement },
    { id: 'sessions', label: '課程日期 / Session Dates', component: SessionManagement }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-dashboard">
      <h1>TA Admin Dashboard / 助教管理面板</h1>
      
      <div className="semester-selector">
        <label>
          <strong>Semester / 學期: </strong>
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