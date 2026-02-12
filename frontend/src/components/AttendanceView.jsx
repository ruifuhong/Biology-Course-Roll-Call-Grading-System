import { useState, useEffect } from 'react';
import { naturalSort } from '../utils/sortUtils';
import '../styles/StudentManagement.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const COURSE_TYPE_KEY = 'attendanceViewCourseType';

export default function AttendanceView({ semester }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [courseType, setCourseType] = useState(() => {
    return localStorage.getItem(COURSE_TYPE_KEY) || 'lecture';
  });

  useEffect(() => {
    localStorage.setItem(COURSE_TYPE_KEY, courseType);
  }, [courseType]);

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
        setSessionDates={setSessionDates}
        setMessage={setMessage}
      />

      <FeedbackList feedbackData={feedbackData} courseType={courseType} loading={loading} />
    </div>
  )
}

function AttendanceTable({ attendanceData, sessionDates, courseType, loading, onRefresh, setSessionDates, setMessage }) {
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

  const calculateAttendanceStats = (attendanceMap, sessionDates) => {
    let present = 0;
    let absent = 0;
    let late = 0;
    sessionDates.forEach(session => {
      const status = attendanceMap[session.actual_date];
      if (status === 'present') {
        present++;
      } else if (status === 'late') {
        late++;
      } else {
        absent++;
      }
    });
    return { present, absent, late };
  };

  const groupedStudents = groupAttendanceByStudent().sort(naturalSort);
  const filteredSessionDates = courseType === 'lecture'
    ? sessionDates.filter(session => session.attendance_required !== false)
    : sessionDates;
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
                {courseType === 'lecture' ? (
                  <>
                    <th rowSpan="2">
                      出席次數 Present
                      <div className="attendance-stats-note">僅計算有點名日期<br />Only count checked dates</div>
                    </th>
                  </>
                ) : (
                  <th rowSpan="2">準時次數 On Time</th>
                )}
                {courseType === 'discussion' && (
                  <th rowSpan="2">遲到次數 Late</th>
                )}
                {courseType === 'lecture' ? (
                  <th rowSpan="2">
                    缺席次數 Absent
                    <div className="attendance-stats-note">已排除未點名日期<br />Dates not checked excluded</div>
                  </th>
                ) : (
                  <th rowSpan="2">缺席次數 Absent</th>
                )}
              </tr>
              <tr>
                {sessionDates.map((session, idx) => (
                  <th key={session.actual_date} className="date-header">
                    <div className="date-header-content">
                      <div className="date-label">
                        {new Date(session.actual_date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                      </div>
                      {courseType === 'lecture' && (
                        <AttendanceRequiredToggleButton
                          actualDate={session.actual_date}
                          attendanceRequired={!!session.attendance_required}
                          semester={session.semester}
                          onToggled={updated => {
                            setSessionDates(prev => prev.map(d => d.actual_date === session.actual_date ? { ...d, attendance_required: updated } : d));
                          }}
                          setMessage={setMessage}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedStudents.map(student => {
                const stats = calculateAttendanceStats(student.attendance, filteredSessionDates);
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
                          {status === 'present' ? '✓' : status === 'late' ? '⧗' : '-'}
                        </td>
                      );
                    })}
                    <td className="stats-cell present">{stats.present}</td>
                    {courseType === 'discussion' && (
                      <td className="stats-cell late">{stats.late}</td>
                    )}
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

function AttendanceRequiredToggleButton({ actualDate, attendanceRequired, semester, onToggled, setMessage }) {
  const [loading, setLoading] = useState(false);

  const handleToggleAttendanceRequired = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/sessions/lecture-dates/${semester}/${actualDate}/attendance-required`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceRequired: !attendanceRequired })
      });
      if (response.ok) {
        const updated = await response.json();
        onToggled(updated.attendance_required);
        const formattedDate = new Date(actualDate).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
        setMessage && setMessage(attendanceRequired ? `${formattedDate} 已設為未點名 Set as Not Checked` : `${formattedDate} 已設為有點名 Set as Checked`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage && setMessage(errorData.error || '切換點名狀態失敗 Failed to toggle attendance required');
      }
    } catch (error) {
      setMessage && setMessage('切換點名狀態失敗 Failed to toggle attendance required: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      className={`btn attendance-required-toggle-btn ${attendanceRequired ? 'required' : 'not-required'}`}
      onClick={handleToggleAttendanceRequired}
      disabled={loading}
      title={attendanceRequired ? '切換為未點名 Switch to Not Checked' : '切換為有點名 Switch to Checked'}
      aria-label={attendanceRequired ? '切換為未點名 Switch to Not Checked' : '切換為有點名 Switch to Checked'}
    >
      <span className="toggle-icon">{attendanceRequired ? '✅' : '❌'}</span>
      <span className="toggle-text">
        <span className="toggle-text-chinese">{attendanceRequired ? '有點名' : '未點名'}</span>
        <span className="toggle-text-english">{attendanceRequired ? 'Checked' : 'Not Checked'}</span>
      </span>
    </button>
  );
}