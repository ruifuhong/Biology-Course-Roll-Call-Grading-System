import { useState } from 'react';
import StudentList from './StudentList';
import AttendanceView from './AttendanceView';
import '../styles/StudentManagement.css';

export default function StudentManagement({ semester }) {
  const [viewMode, setViewMode] = useState('attendance');

  return (
    <div className="student-management">
      <h2>學生管理 - {semester} Student Management - {semester}</h2>
      
      <div className="view-mode-tabs" style={{ marginBottom: '20px' }}>
      <button
          onClick={() => setViewMode('attendance')}
          className={`btn ${viewMode === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📊 查看出席 View Attendance
        </button>
        <button
          onClick={() => setViewMode('students')}
          className={`btn ${viewMode === 'students' ? 'btn-primary' : 'btn-secondary'}`}
        >
          👥 管理學生 Manage Students
        </button>
        
      </div>

      {viewMode === 'students' && <StudentList semester={semester} />}
      {viewMode === 'attendance' && <AttendanceView semester={semester} />}
    </div>
  );
}