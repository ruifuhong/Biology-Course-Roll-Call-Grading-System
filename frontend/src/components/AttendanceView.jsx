import { useState, useEffect } from 'react';
import '../styles/StudentManagement.css';

export default function AttendanceView({ semester }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [courseType, setCourseType] = useState('lecture');
  const [attendanceData, setAttendanceData] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (semester) {
      fetchAttendanceData();
    }
  }, [semester, courseType]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const [attendanceResponse, datesResponse] = await Promise.all([
        fetch(`${apiBase}/attendance/lecture/${semester}`),
        fetch(`${apiBase}/sessions/lecture-dates/${semester}`)
      ]);

      if (attendanceResponse.ok) {
        const attendance = await attendanceResponse.json();
        setAttendanceData(attendance);
      } else {
        setMessage('Failed to load attendance data / 載入出席資料失敗');
        setAttendanceData([]);
      }

      if (datesResponse.ok) {
        const dates = await datesResponse.json();
        const sortedDates = dates.sort((a, b) => a.session_order - b.session_order);
        setSessionDates(sortedDates);
      } else {
        setMessage('Failed to load session dates / 載入課程日期失敗');
        setSessionDates([]);
      }
    } catch (error) {
      setMessage('Error loading attendance data: ' + error.message + ' / 載入出席資料錯誤: ' + error.message);
      setAttendanceData([]);
      setSessionDates([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-view">
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="course-type-tabs" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setCourseType('lecture')}
          className={`btn ${courseType === 'lecture' ? 'btn-primary' : 'btn-secondary'}`}
        >
          正課 (Lecture)
        </button>
        <button
          onClick={() => setCourseType('discussion')}
          className={`btn ${courseType === 'discussion' ? 'btn-primary' : 'btn-secondary'}`}
        >
          討論課 (Discussion)
        </button>
      </div>

      <AttendanceTable 
        attendanceData={attendanceData}
        sessionDates={sessionDates}
        courseType={courseType}
        loading={loading}
        onRefresh={fetchAttendanceData}
      />
    </div>
  );
}

function AttendanceTable({ attendanceData, sessionDates, courseType, loading, onRefresh }) {
  const calculateAttendanceStats = (attendanceRecord) => {
    let present = 0;
    let absent = 0;
    
    for (let i = 1; i <= 18; i++) {
      const columnName = `date${i}`;
      const status = attendanceRecord[columnName];
      if (status === 'present') {
        present++;
      } else if (status === 'absent') {
        absent++;
      }
    }
    
    return { present, absent };
  };

  const getDateHeader = (sessionOrder) => {
    const sessionDate = sessionDates.find(d => d.session_order === sessionOrder);
    if (sessionDate) {
      const date = new Date(sessionDate.actual_date);
      return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
    }
    return `date${sessionOrder}`;
  };

  return (
    <div className="attendance-table-view">
      <div className="attendance-header">
        <h3>{courseType === 'lecture' ? 'Lecture / 正課' : 'Discussion / 討論課'} Attendance - {attendanceData.length} students / 出席 - {attendanceData.length} 學生</h3>
        <button onClick={onRefresh} className="btn btn-secondary" disabled={loading}>
          {loading ? 'Loading... / 載入中...' : '🔄 Refresh / 重新整理'}
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading attendance data... / 載入出席資料中...</div>
      ) : attendanceData.length === 0 ? (
        <div className="no-data">No attendance data found for this semester. / 本學期未找到出席資料。</div>
      ) : (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th rowSpan="2">組別 / Group</th>
                <th rowSpan="2">Student ID / 學號</th>
                <th rowSpan="2">系級 / Department</th>
                <th rowSpan="2">Name / 姓名</th>
                <th colSpan="18">Session Dates / 課程日期</th>
                <th rowSpan="2">出席次數 / Present</th>
                <th rowSpan="2">缺席次數 / Absent</th>
              </tr>
              <tr>
                {Array.from({ length: 18 }, (_, i) => (
                  <th key={i + 1} className="date-header">
                    {getDateHeader(i + 1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(record => {
                const stats = calculateAttendanceStats(record);
                return (
                  <tr key={record.student_id}>
                    <td>{record.group_name || 'N/A'}</td>
                    <td>{record.student_id}</td>
                    <td>{record.department}</td>
                    <td>{record.name}</td>
                    {Array.from({ length: 18 }, (_, i) => {
                      const columnName = `date${i + 1}`;
                      const status = record[columnName];
                      return (
                        <td key={i + 1} className={`attendance-cell ${status}`}>
                          {status === 'present' ? '✓' : status === 'absent' ? '✗' : '-'}
                        </td>
                      );
                    })}
                    <td className="stats-cell present">{stats.present}</td>
                    <td className="stats-cell absent">{stats.absent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}