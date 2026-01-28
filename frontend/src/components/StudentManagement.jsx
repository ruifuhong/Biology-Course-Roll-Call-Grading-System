import { useState } from 'react';
import StudentList from './StudentList';
import AttendanceView from './AttendanceView';
import ScoreView from './ScoreView';
import '../styles/StudentManagement.css';

export default function StudentManagement({ semester }) {
  const [viewMode, setViewMode] = useState('attendance');

  return (
    <div className="student-management">
      <h2>學生管理 - {semester} Student Management - {semester}</h2>
      

      <div className="view-mode-tabs margin-bottom-20">
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
        <button
          onClick={() => setViewMode('scores')}
          className={`btn ${viewMode === 'scores' ? 'btn-primary' : 'btn-secondary'}`}
        >
          🏅 查看評分 View Scores
        </button>
      </div>

      {viewMode === 'students' && <StudentList semester={semester} />}
      {viewMode === 'attendance' && <AttendanceView semester={semester} />}
      {viewMode === 'scores' && <ScoreView semester={semester} />}
    </div>
  );
}