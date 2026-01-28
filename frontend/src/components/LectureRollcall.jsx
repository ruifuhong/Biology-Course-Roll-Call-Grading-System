import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
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
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCurrentSession();

    const socket = io(apiBase);
    socket.on('connect', () => {
      // console.log('Socket.IO connected! Your socket id: ' + socket.id);
    });
    socket.on('disconnect', () => {
      // setMessage('Socket.IO disconnected');
    });

    socket.on('rollcallState', (data) => {
      if (data.type !== 'lecture') return;
      setSessionInfo(prev => {
        if (!prev) return prev;
        if (
          (data.session_order && prev.session_order === data.session_order) ||
          (data.actualDate && prev.actual_date === data.actualDate)
        ) {
          return { ...prev, status: data.status };
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
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
      console.error('取得課程資訊錯誤 Error fetching session info:', error);
    }
  };

  const lookupStudent = async (studentIdValue) => {
    if (!studentIdValue.trim()) {
      setStudentInfo({ name: '', department: '' });
      setAlreadySubmitted(false);
      return;
    }

    setLookupLoading(true);
    setAlreadySubmitted(false);
    try {
      let semester = sessionInfo?.semester;
      let actual_date = sessionInfo?.actual_date;
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

      // 1. Lookup student info
      const response = await fetch(`${apiBase}/students/${semester}/${studentIdValue}`);
      if (response.ok) {
        const student = await response.json();
        setStudentInfo({
          name: student.name || '',
          department: student.department || ''
        });
        setMessage('');

        // 2. Check for duplicate attendance if sessionInfo is available
        if (sessionInfo && sessionInfo.actual_date) {
          const attRes = await fetch(`${apiBase}/attendance/lecture/${semester}/${studentIdValue}`);
          if (attRes.ok) {
            const attList = await attRes.json();
            const found = Array.isArray(attList) && attList.some(a => a.actual_date && a.actual_date.split('T')[0] === sessionInfo.actual_date.split('T')[0]);
            if (found) {
              setAlreadySubmitted(true);
              setMessage('您今天已經提交過本課程的出席紀錄\nYou have already submitted attendance for this session today');
            } else {
              setAlreadySubmitted(false);
            }
          }
        }
      } else {
        setStudentInfo({ name: '', department: '' });
        setAlreadySubmitted(false);
        if (response.status === 404) {
          setMessage('查無此學號 Student ID not found in this semester');
        }
      }
    } catch (error) {
      setStudentInfo({ name: '', department: '' });
      setAlreadySubmitted(false);
      setMessage('查詢學生資訊錯誤 Error looking up student information');
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
      setMessage('請輸入學號 Please enter your student ID');
      return;
    }
    if (!studentInfo.name) {
      setMessage('查無學生資訊，請確認學號 Student information not found. Please verify your student ID.');
      return;
    }
    if (!sessionInfo) {
      setMessage('查無有效課程 No active session found');
      return;
    }
    if (!sessionInfo.status === 'open') {
      setMessage('此課程點名已關閉 Attendance submission is currently closed for this session');
      return;
    }
    if (alreadySubmitted) {
      setMessage('您今天已經提交過本場次的出席紀錄\nYou have already submitted attendance for this session today');
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
        feedbackPromise = fetch(`${apiBase}/feedback/lecture`, {
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
        setMessage('提交成功！Submitted successfully!');
        setStudentId('');
        setStudentInfo({ name: '', department: '' });
        setFeedback('');
        setAlreadySubmitted(false);
      } else {
        setMessage('提交失敗 Error submitting attendance or feedback');
      }
    } catch (error) {
      setMessage('提交錯誤 Error submitting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rollcall-page">
      <div className="rollcall-header">
        <h1>生物學課程點名系統 Biology Course Rollcall System</h1>
        <div className="course-type">正課 Lecture</div>
      </div>

      {sessionInfo && (
        <div className="session-info">
          <h3>課程資訊 Session Information</h3>
          <div className={`attendance-status ${sessionInfo.status === 'open' ? 'open' : 'closed'}`}>
            <strong>點名狀態 Attendance Status: </strong>
            {sessionInfo.status === 'open' ? (
              <span className="status-open">🟢 開放中 Open</span>
            ) : (
              <span className="status-closed">🔴 已關閉 Closed</span>
            )}
          </div>
          <p><strong>場次 Session:</strong> {sessionInfo.session_order}</p>
          <p><strong>日期 Date:</strong> {new Date(sessionInfo.actual_date).toLocaleDateString('zh-TW', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>學期 Semester:</strong> {sessionInfo.semester}</p>
          {sessionInfo.isUpcoming && (
            <p className="upcoming-session-warning">
              注意：這是即將到來的課程。點名尚未開放。Note: This is an upcoming session. Attendance submission may not be available yet.
            </p>
          )}
        </div>
      )}

      <div className="instructions">
        <h4>使用說明 Instructions</h4>
        <ul>
          <li>請輸入您註冊的學號 Enter your student ID exactly as registered</li>
          <li>每堂課僅需提交一次 Submit only once per session</li>
          <li>如有問題請聯繫老師 Contact instructor if you have issues</li>
        </ul>
      </div>

      {message && (
        <div className={
          message.includes('成功') ? 'success-message' : 
          message.includes('錯誤') || message.includes('失敗') || message.includes('查無') ? 'error-message' : 
          'loading-message'
        }>
          {message}
        </div>
      )}

      <form className="rollcall-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="studentId">
            學號 Student ID *
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={handleStudentIdChange}
            placeholder="請輸入學號 Enter your student ID"
            disabled={loading}
            autoFocus
          />
          {lookupLoading && (
            <small className="lookup-loading">
              查詢學生資訊中... Looking up student information...
            </small>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="department">
            系級 Department
          </label>
          <input
            type="text"
            id="department"
            value={studentInfo.department}
            placeholder="系級將自動帶出 Department will auto-populate"
            disabled
            className={studentInfo.department ? "input-filled" : "input-empty"}
          />
        </div>

        <div className="form-field">
          <label htmlFor="name">
            姓名 Name
          </label>
          <input
            type="text"
            id="name"
            value={studentInfo.name}
            placeholder="姓名將自動帶出 Name will auto-populate"
            disabled
            className={studentInfo.name ? "input-filled" : "input-empty"}
          />
        </div>

        <div className="form-field">
          <label htmlFor="feedback">
            意見回饋 Feedback
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
          disabled={loading || !sessionInfo || !studentInfo.name || sessionInfo?.status !== 'open' || alreadySubmitted}
        >
          {alreadySubmitted
            ? '您已於今日點過名 Already Submitted'
            : loading
              ? '提交中... Submitting...'
              : sessionInfo?.status === 'closed'
                ? '點名已關閉 Attendance Closed'
                : '提交出席 Submit Attendance'}
        </button>
      </form>

      <div className="back-link">
        <a href="/">← 返回主頁 Back to Main Page</a>
      </div>
    </div>
  );
}