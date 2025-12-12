import { useState, useEffect } from 'react';
import '../styles/RollcallPage.css';

export default function LectureRollcall() {
  const [studentId, setStudentId] = useState('');
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    department: ''
  });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const fetchCurrentSession = async () => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      let academicYear = currentYear - 1911;
      if (currentMonth >= 8) {
        academicYear = currentYear - 1911;
      } else {
        academicYear = currentYear - 1912;
      }
      
      const currentSemesterNum = currentMonth >= 2 && currentMonth <= 7 ? 2 : 1;
      const semester = `${academicYear}${currentSemesterNum}`;
      
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${apiBase}/sessions/lecture-dates/${semester}`);
      if (response.ok) {
        const lectureDates = await response.json();
        
        const todaySession = lectureDates.find(session => 
          session.actual_date.split('T')[0] === today
        );
        
        if (todaySession) {
          setSessionInfo({
            ...todaySession,
            courseType: 'lecture',
            courseName: '正課 (Lecture)',
            semester
          });
        } else {
          const upcomingSession = lectureDates.find(session => 
            new Date(session.actual_date) > new Date()
          );
          if (upcomingSession) {
            setSessionInfo({
              ...upcomingSession,
              courseType: 'lecture',
              courseName: '正課 (Lecture)',
              semester,
              isUpcoming: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session info:', error);
    }
  };

  const lookupStudent = async (studentIdValue) => {
    if (!studentIdValue.trim()) {
      setStudentInfo({ name: '', department: '' });
      return;
    }

    setLookupLoading(true);
    try {
      let semester = sessionInfo?.semester;
      if (!semester) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        let academicYear = currentYear - 1911;
        if (currentMonth >= 8) {
          academicYear = currentYear - 1911;
        } else {
          academicYear = currentYear - 1912;
        }
        
        const currentSemesterNum = currentMonth >= 2 && currentMonth <= 7 ? 2 : 1;
        semester = `${academicYear}${currentSemesterNum}`;
      }
      
      const response = await fetch(`${apiBase}/students/${semester}/${studentIdValue}`);
      
      if (response.ok) {
        const student = await response.json();
        setStudentInfo({
          name: student.name || '',
          department: student.department || ''
        });
        setMessage('');
      } else {
        setStudentInfo({ name: '', department: '' });
        if (response.status === 404) {
          setMessage('Student ID not found in this semester');
        }
      }
    } catch (error) {
      console.error('Error looking up student:', error);
      setStudentInfo({ name: '', department: '' });
      setMessage('Error looking up student information');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    setStudentId(value);
    
    if (value.length >= 5) { // Assuming student IDs are at least 5 characters
      lookupStudent(value);
    } else {
      setStudentInfo({ name: '', department: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      setMessage('Please enter your student ID');
      return;
    }

    if (!studentInfo.name) {
      setMessage('Student information not found. Please verify your student ID.');
      return;
    }

    if (!sessionInfo) {
      setMessage('No active session found');
      return;
    }

    if (!sessionInfo.is_active) {
      setMessage('Attendance submission is currently closed for this session / 此課程點名已關閉');
      return;
    }

    setLoading(true);
    try {
      const attendancePromise = fetch(`${apiBase}/attendance/lecture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: sessionInfo.semester,
          studentId: studentId,
          actual_date: sessionInfo.actual_date,
          status: 'present'
        })
      });

      let feedbackPromise = Promise.resolve({ ok: true });
      if (feedback && feedback.trim() !== '') {
        feedbackPromise = fetch(`${apiBase}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            name: studentInfo.name,
            semester: sessionInfo.semester,
            actual_date: sessionInfo.actual_date,
            feedback
          })
        });
      }

      const [attendanceRes, feedbackRes] = await Promise.all([attendancePromise, feedbackPromise]);

      if (attendanceRes.ok && feedbackRes.ok) {
        setMessage('成功！Attendance and feedback submitted.');
        setStudentId('');
        setStudentInfo({ name: '', department: '' });
        setFeedback('');
      } else {
        const attendanceError = attendanceRes.ok ? null : await attendanceRes.json();
        const feedbackError = feedbackRes.ok ? null : await feedbackRes.json();
        setMessage(
          `Error: ${attendanceError?.error || ''} ${feedbackError?.error || ''}`.trim()
        );
      }
    } catch (error) {
      setMessage('Error submitting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rollcall-page">
      <div className="rollcall-header">
        <h1>生物學課程點名系統</h1>
        <h1>Biology Course Rollcall System</h1>
        <div className="course-type">正課 (Lecture)</div>
      </div>

      {sessionInfo && (
        <div className="session-info">
          <h3>Session Information / 課程資訊</h3>
          <div className={`attendance-status ${sessionInfo.is_active ? 'open' : 'closed'}`}>
            <strong>Attendance Status / 點名狀態: </strong>
            {sessionInfo.is_active ? (
              <span className="status-open">🟢 Open / 開放中</span>
            ) : (
              <span className="status-closed">🔴 Closed / 已關閉</span>
            )}
          </div>
          <p><strong>Session:</strong> {sessionInfo.session_order}</p>
          <p><strong>Date:</strong> {new Date(sessionInfo.actual_date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Semester:</strong> {sessionInfo.semester}</p>
          {sessionInfo.isUpcoming && (
            <p style={{ color: '#856404', fontWeight: 'bold' }}>
              Note: This is an upcoming session. Attendance submission may not be available yet.
            </p>
          )}
        </div>
      )}

      <div className="instructions">
        <h4>Instructions / 使用說明</h4>
        <ul>
          <li>Enter your student ID exactly as registered / 請輸入您註冊的學號</li>
          <li>Submit only once per session / 每堂課僅需提交一次</li>
          <li>Contact instructor if you have issues / 如有問題請聯繫老師</li>
        </ul>
      </div>

      {message && (
        <div className={
          message.includes('成功') || message.includes('successfully') ? 'success-message' : 
          message.includes('Error') || message.includes('not found') ? 'error-message' : 
          'loading-message'
        }>
          {message}
        </div>
      )}

      <form className="rollcall-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="studentId">
            Student ID / 學號 *
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={handleStudentIdChange}
            placeholder="Enter your student ID"
            disabled={loading}
            autoFocus
          />
          {lookupLoading && (
            <small className="lookup-loading">
              Looking up student information...
            </small>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="department">
            系級 / Department
          </label>
          <input
            type="text"
            id="department"
            value={studentInfo.department}
            placeholder="Department will auto-populate"
            disabled
            className={studentInfo.department ? "input-filled" : "input-empty"}
          />
        </div>

        <div className="form-field">
          <label htmlFor="name">
            Name / 姓名
          </label>
          <input
            type="text"
            id="name"
            value={studentInfo.name}
            placeholder="Name will auto-populate"
            disabled
            className={studentInfo.name ? "input-filled" : "input-empty"}
          />
        </div>

        <div className="form-field">
          <label htmlFor="feedback">
            Feedback / 意見回饋
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="輸入回饋（非必填） Enter feedback (optional)"
            rows={3}
            className="feedback-textarea"
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !sessionInfo || !studentInfo.name || !sessionInfo?.is_active}
        >
          {loading ? '提交中... Submitting...' : 
           !sessionInfo?.is_active ? '點名已關閉 Attendance Closed' :
           '提交出席 Submit Attendance'}
        </button>
      </form>

      <div className="back-link">
        <a href="/">← Back to Main Page / 返回主頁</a>
      </div>
    </div>
  );
}