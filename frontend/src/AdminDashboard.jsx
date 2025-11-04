import { useState } from 'react';
import StudentManagement from './StudentManagement';
import SessionManagement from './SessionManagement';
import './styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  
  const generateSemesterOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    let academicYear = currentYear - 1911;
    if (currentMonth >= 8) {
      academicYear = currentYear - 1911;
    } else {
      academicYear = currentYear - 1912;
    }
    
    let currentSemesterNum = currentMonth >= 2 && currentMonth <= 7 ? 2 : 1;
    
    const startYear = 113;
    
    for (let year = startYear; year <= academicYear; year++) {
      const startSemester = 1;
      const endSemester = (year === academicYear) ? currentSemesterNum : 2;
      
      for (let sem = startSemester; sem <= endSemester; sem++) {
        const semesterCode = `${year}${sem}`;
        const semesterLabel = `${year}-${sem}`;
        const seasonLabel = sem === 1 ? 'Fall' : 'Spring';
        const calendarYear = year + 1911 + (sem === 1 ? 0 : 1);
        
        options.push({
          value: semesterCode,
          label: `${semesterLabel} (${seasonLabel} ${calendarYear})`
        });
      }
    }
    
    return options.reverse();
  };

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