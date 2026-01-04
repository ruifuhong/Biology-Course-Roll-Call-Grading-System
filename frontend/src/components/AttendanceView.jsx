import { useState, useEffect } from 'react';
import { naturalSort } from '../utils/sortUtils';
import '../styles/StudentManagement.css';

export default function AttendanceView({ semester }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [courseType, setCourseType] = useState('lecture');
  const [attendanceData, setAttendanceData] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (semester) {
      fetchAttendanceData();
      fetchFeedbackData();
    }
  }, [semester, courseType]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      let attendanceUrl, datesUrl;
      if (courseType === 'lecture') {
        attendanceUrl = `${apiBase}/attendance/lecture/${semester}`;
        datesUrl = `${apiBase}/sessions/lecture-dates/${semester}`;
      } else {
        attendanceUrl = `${apiBase}/attendance/discussion/${semester}`;
        datesUrl = `${apiBase}/sessions/discussion-dates/${semester}`;
      }

      const [attendanceResponse, datesResponse] = await Promise.all([
        fetch(attendanceUrl),
        fetch(datesUrl)
      ]);

      if (attendanceResponse.ok) {
        const attendance = await attendanceResponse.json();
        const sortedAttendance = attendance.sort(naturalSort);
        setAttendanceData(sortedAttendance);
      } else {
        setMessage('載入出席資料失敗 Failed to load attendance data');
        setAttendanceData([]);
      }

      if (datesResponse.ok) {
        const dates = await datesResponse.json();
        const sortedDates = dates.sort((a, b) => a.session_order - b.session_order);
        setSessionDates(sortedDates);
      } else {
        setMessage('載入課程日期失敗 Failed to load session dates');
        setSessionDates([]);
      }
    } catch (error) {
      setMessage('載入出席資料錯誤 Error loading attendance data: ' + error.message);
      setAttendanceData([]);
      setSessionDates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      let feedbackUrl;
      if (courseType === 'lecture') {
        feedbackUrl = `${apiBase}/feedback/lecture/${semester}`;
      } else {
        feedbackUrl = `${apiBase}/feedback/discussion/${semester}`;
      }
      const feedbackResponse = await fetch(feedbackUrl);
      if (feedbackResponse.ok) {
        const feedbacks = await feedbackResponse.json();
        setFeedbackData(feedbacks);
      } else {
        setMessage('載入回饋失敗 Failed to load feedback');
        setFeedbackData([]);
      }
    } catch (error) {
      setMessage('載入回饋錯誤 Error loading feedback: ' + error.message);
      setFeedbackData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-view">
      {message && (
        <div className={`message ${message.includes('錯誤') || message.includes('失敗') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="course-type-tabs margin-bottom-20">
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
        onRefresh={() => { fetchAttendanceData(); fetchFeedbackData(); }}
      />

      <FeedbackList feedbackData={feedbackData} courseType={courseType} loading={loading} />
    </div>
  )
}

function AttendanceTable({ attendanceData, sessionDates, courseType, loading, onRefresh }) {
  const groupAttendanceByStudent = () => {
    const grouped = {};
    attendanceData.forEach(record => {
      if (!grouped[record.student_id]) {
        grouped[record.student_id] = {
          ...record,
          attendance: {}
        };
      }
      if (record.actual_date) {
        grouped[record.student_id].attendance[record.actual_date] = record.status;
      }
    });
    return Object.values(grouped);
  };

  const calculateAttendanceStats = (attendanceMap) => {
    let present = 0;
    let absent = 0;
    Object.values(attendanceMap).forEach(status => {
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
    });
    return { present, absent };
  };

  const groupedStudents = groupAttendanceByStudent();
  return (
    <div className="attendance-table-view">
      <div className="attendance-header">
        <h3>{courseType === 'lecture' ? '正課 Lecture' : '討論課 Discussion'} 出席 Attendance - {groupedStudents.length} 學生 students</h3>
        <button onClick={onRefresh} className="btn btn-secondary" disabled={loading}>
          {loading ? '載入中... Loading...' : '🔄 重新整理 Refresh'}
        </button>
      </div>
      {loading ? (
        <div className="loading">載入出席資料中... Loading attendance data...</div>
      ) : groupedStudents.length === 0 ? (
        <div className="no-data">本學期未找到出席資料。No attendance data found for this semester.</div>
      ) : (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th rowSpan="2">組別 Group</th>
                <th rowSpan="2">學號 Student ID</th>
                <th rowSpan="2">系級 Department</th>
                <th rowSpan="2">姓名 Name</th>
                <th colSpan={sessionDates.length}>課程日期 Session Dates</th>
                <th rowSpan="2">出席次數 Present</th>
                <th rowSpan="2">缺席次數 Absent</th>
              </tr>
              <tr>
                {sessionDates.map((session, idx) => (
                  <th key={session.actual_date} className="date-header">
                    {new Date(session.actual_date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedStudents.map(student => {
                const stats = calculateAttendanceStats(student.attendance);
                return (
                  <tr key={student.student_id}>
                    <td>{student.group_name || 'N/A'}</td>
                    <td>{student.student_id}</td>
                    <td>{student.department}</td>
                    <td>{student.name}</td>
                    {sessionDates.map(session => {
                      const status = student.attendance[session.actual_date];
                      return (
                        <td key={session.actual_date} className={`attendance-cell ${status}`}>
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

 function FeedbackList({ feedbackData, courseType, loading }) {
    return (
      <div className="feedback-list-container">
        <h3 className="feedback-list-title">
          {courseType === 'lecture' ? '正課回饋 Lecture Feedback' : '討論課回饋 Discussion Feedback'}
        </h3>
        {loading ? (
          <div className="loading">載入回饋中... Loading feedback...</div>
        ) : feedbackData.length === 0 ? (
          <div className="no-data">本學期未找到回饋。No feedback found for this semester.</div>
        ) : (
          <ul className="feedback-list">
            {feedbackData.map(fb => (
              <li key={fb._id} className="feedback-item">
                <div className="feedback-meta">
                  <span className="feedback-student">{fb.name} ({fb.studentId})</span>
                  <span className="feedback-date">{new Date(fb.actual_date).toLocaleDateString('zh-TW')}</span>
                </div>
                <div className="feedback-content">{fb.feedback}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }