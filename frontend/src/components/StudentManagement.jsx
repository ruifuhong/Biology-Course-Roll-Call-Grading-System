import { useState } from 'react';
import StudentList from './StudentList';
import AttendanceView from './AttendanceView';
import '../styles/StudentManagement.css';

export default function StudentManagement({ semester }) {
  const [viewMode, setViewMode] = useState('students');

  return (
    <div className="student-management">
      <h2>Student Management - {semester} / 學生管理 - {semester}</h2>
      
      <div className="view-mode-tabs" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setViewMode('students')}
          className={`btn ${viewMode === 'students' ? 'btn-primary' : 'btn-secondary'}`}
        >
          👥 Manage Students / 管理學生
        </button>
        <button
          onClick={() => setViewMode('attendance')}
          className={`btn ${viewMode === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📊 View Attendance / 查看出席
        </button>
      </div>

      {viewMode === 'students' && <StudentList semester={semester} />}
      {viewMode === 'attendance' && <AttendanceView semester={semester} />}
    </div>
  );
}