import { useState, useEffect } from 'react';
import ReviewSubmitButton from './ReviewSubmitButton';
import '../styles/ReviewInput.css';

function getCurrentSemester() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  let academicYear;
  if (currentMonth >= 8) {
    academicYear = currentYear - 1911;
  } else {
    academicYear = currentYear - 1912;
  }
  const currentSemesterNum = currentMonth >= 2 && currentMonth <= 7 ? 2 : 1;
  return `${academicYear}${currentSemesterNum}`;
}


function GroupReviewInput() {
  const [studentId, setStudentId] = useState('');
  const [submittedId, setSubmittedId] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const fetchCurrentSession = async () => {
    setLoading(true);
    setError('');
    try {
      const currentSemester = getCurrentSemester();
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${apiBase}/sessions/discussion-dates/${currentSemester}`);
      if (response.ok) {
        const discussionDates = await response.json();
        const todaySession = discussionDates.find(session => session.actual_date.split('T')[0] === today);
        if (todaySession) {
          setSessionInfo({
            ...todaySession,
            courseType: 'discussion',
            courseName: '討論課 (Discussion)',
            semester: currentSemester
          });
        } else {
          const upcomingSession = discussionDates.find(session => new Date(session.actual_date) > new Date());
          if (upcomingSession) {
            setSessionInfo({
              ...upcomingSession,
              courseType: 'discussion',
              courseName: '討論課 (Discussion)',
              semester: currentSemester,
              isUpcoming: true
            });
          } else {
            setSessionInfo(null);
          }
        }
      } else {
        setError('無法取得課程資訊 Failed to fetch session info');
      }
    } catch (err) {
      setError('錯誤，無法取得課程資訊 Failed to fetch session info');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedId(studentId);
    setStudentInfo(null);
    setError('');
    setAlreadyReviewed(false);
    if (!sessionInfo || !sessionInfo.semester) {
      setError('查無今日課程資訊 Session info for today not found');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/review/${sessionInfo.semester}/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudentInfo(data);
        const groupName = data.student?.group_name;
        const dupRes = await fetch(
          `${apiBase}/review/duplicate-check/${studentId}/${groupName}/${sessionInfo.semester}/${encodeURIComponent(sessionInfo.actual_date)}`
        );
        if (dupRes.ok) {
          const dupData = await dupRes.json();
          if (dupData.exists) {
            setAlreadyReviewed(true);
            return;
          }
        } else {
          setError('無法檢查是否已提交評分 Unable to check for duplicate review');
        }
      } else {
        const errData = await res.json();
        setError(errData.error || '請確認您輸入的學號是否正確 Please confirm the student ID number entered');
      }
    } catch (err) {
      setError('查詢學生資訊失敗 Failed to fetch student info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="review-container">
        {loading ? (
        <div>載入課程資訊中... Loading session info...</div>
      ) : error ? (
        <div className="review-error">{error}</div>
      ) : sessionInfo ? (
        <div className="review-session-info">
          <strong>學期 Semester:</strong> {sessionInfo.semester}<br />
          <strong>日期 Date:</strong> {new Date(sessionInfo.actual_date).toLocaleDateString('zh-TW', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>
      ) : (
        <div className="review-session-info">查無今日課程 No session found for today</div>
      )}
      {submittedId ? (
        <div className="review-submitted-id">
          <button
            type="button"
            className="review-back-btn"
            onClick={() => {
              if (alreadyReviewed || (studentInfo && studentInfo.noAttendance)) {
                setSubmittedId(null);
                setStudentInfo(null);
                setError('');
                setAlreadyReviewed(false);
                return;
              }
              else if (
                window.confirm('確定要返回輸入學號頁面嗎？若有未儲存內容將遺失\nAre you sure you want to go back to the student ID input page? Unsaved content will be lost.')
              ) {
                setSubmittedId(null);
                setStudentInfo(null);
                setError('');
                setAlreadyReviewed(false);
              }
            }}
          >
            ← 返回輸入學號頁 Back to Student ID Input
          </button>
          {alreadyReviewed ? (
            <div className="review-no-attendance">
              您已提交過本次評分<br />
              You have already submitted reviews for this session.
            </div>
          ) : studentInfo && (
            studentInfo.noAttendance ? (
              <div className="review-no-attendance">
                您未在本堂討論課點名，如有疑問請洽助教。<br />
                You did not sign in for this discussion session. If you have questions, please contact the TA.
              </div>
            ) : (
              <form
                className="review-info-panel"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  const intraReviews = [];
                  let intraValid = true;
                  if (studentInfo && studentInfo.groupMembers) {
                    studentInfo.groupMembers.forEach((member, idx) => {
                      if (member.attendance_status === "present") {
                        const select = document.querySelectorAll('.review-member-list .review-dropdown')[idx];
                        const score = select ? parseInt(select.value) : null;
                        if (!score) intraValid = false;
                        if (score) {
                          intraReviews.push({
                            reviewer_id: studentInfo.student.student_id,
                            reviewer_semester: sessionInfo.semester,
                            reviewee_id: member.student_id,
                            reviewee_semester: sessionInfo.semester,
                            score,
                            semester: sessionInfo.semester,
                            actual_date: sessionInfo.actual_date
                          });
                        }
                      }
                    });
                  }
                  // 2. Collect inter-group reviews
                  const interReviews = [];
                  let interValid = true;
                  if (studentInfo && studentInfo.classGroups) {
                    studentInfo.classGroups.forEach((group, idx) => {
                      const select = document.querySelectorAll('.review-other-group-list .review-dropdown')[idx];
                      const score = select ? parseInt(select.value) : null;
                      if (!score) interValid = false;
                      if (score) {
                        interReviews.push({
                          reviewer_group_id: studentInfo.student.group_name,
                          reviewee_group_id: group.group_name,
                          score,
                          semester: sessionInfo.semester,
                          actual_date: sessionInfo.actual_date
                        });
                      }
                    });
                  }
                  
                  if (!interValid || !intraValid) return;
                  // 3. Feedback
                  const feedbackData = {
                    studentId: studentInfo.student.student_id,
                    name: studentInfo.student.name,
                    semester: sessionInfo.semester,
                    actual_date: sessionInfo.actual_date,
                    feedback
                  };
                  setLoading(true);
                  try {
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const intraPromise = fetch(`${apiBase}/review/intra`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reviews: intraReviews })
                    });
                    const interPromise = fetch(`${apiBase}/review/inter`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reviews: interReviews })
                    });
                    let feedbackPromise = Promise.resolve({ ok: true });
                    if (feedback && feedback.trim() !== '') {
                      feedbackPromise = fetch(`${apiBase}/feedback/discussion`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(feedbackData)
                      });
                    }
                    const [intraRes, interRes, feedbackRes] = await Promise.all([intraPromise, interPromise, feedbackPromise]);
                    if (intraRes.status === 409 || interRes.status === 409 || feedbackRes.status === 409) {
                      window.alert('您已提交過本次評分或回饋 You have already submitted reviews or feedback for this session.');
                    } else if (intraRes.ok && interRes.ok && feedbackRes.ok) {
                      window.alert('提交成功！Submitted successfully!');
                      window.location.reload();
                    } else {
                      const intraError = intraRes.ok ? null : await intraRes.json();
                      const interError = interRes.ok ? null : await interRes.json();
                      const feedbackError = feedbackRes.ok ? null : await feedbackRes.json();
                      window.alert(
                        `提交失敗 Error: ${intraError?.error || ''} ${interError?.error || ''} ${feedbackError?.error || ''}`.trim()
                      );
                    }
                  } catch (err) {
                    setError('提交錯誤 Error submitting: ' + err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div className="review-student-info">
                  <span className="review-label">姓名 Name:</span> {studentInfo.student?.name}
                  <br />
                  <span className="review-label">學號 Student ID:</span> {studentInfo.student?.student_id}
                  <br />
                  <span className="review-label">組別 Group:</span> 第{studentInfo.student?.group_name}組
                </div>
                <div className="review-group-members">
                  <span className="review-label">組內互評 Intra-group Scores:</span>
                  {studentInfo.groupMembers && studentInfo.groupMembers.length > 0 ? (
                    <ul className="review-member-list">
                      {studentInfo.groupMembers.map((member, idx) => (
                        <li key={member.student_id || idx} className="review-member-item">
                          {member.name} ({member.student_id})
                          <div className="review-dropdown-row">
                            {(member.attendance_status === 'present' || member.attendance_status === 'late') ? (
                              <select className="review-dropdown" defaultValue="">
                                <option value="" disabled>請選擇 Please select</option>
                                {[60,70,80,90,100].map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="review-absent">未點名 Absent</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="review-no-members">無其他組員 No other group members</div>
                  )}
                </div>
                {studentInfo.classGroups && studentInfo.classGroups.length > 0 && (
                  <div className="review-other-groups">
                    <span className="review-label">組間互評 Inter-group Scores:</span>
                    <ul className="review-other-group-list">
                      {studentInfo.classGroups.map((group, idx) => (
                        <li key={group.group_name || idx} className="review-other-group-item">
                          第{group.group_name}組
                          <div className="review-dropdown-row">
                            <select className="review-dropdown" defaultValue="">
                              <option value="" disabled>請選擇 Please select</option>
                              {[60,70,80,90,100].map(val => (
                                <option key={val} value={val}>{val}</option>
                              ))}
                            </select>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="review-feedback-field">
                  <label htmlFor="groupReviewFeedback">意見回饋 Feedback</label>
                  <textarea
                    id="groupReviewFeedback"
                    className="feedback-textarea"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="輸入回饋（非必填） Enter feedback (optional)"
                    rows={3}
                    disabled={loading}
                  />
                </div>
                <ReviewSubmitButton loading={loading} />
              </form>
            )
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="studentId">請輸入您的學號 Enter Your Student ID:</label><br />
          <input
            id="studentId"
            type="text"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="review-input"
            required
          />
          <button type="submit" className="review-submit-btn">
            送出 Submit
          </button>
        </form>
      )}
        <div className="review-back-link">
          <button type="button" className="switch-page-btn" onClick={() => window.location.href='/discussion-rollcall'}>
            ← 返回討論課點名頁 Back to Discussion Class Rollcall Page
          </button>
        </div>
      </div>
      <div className="mainpage-link-container">
        <a href="/" className="mainpage-back-link">← 返回主頁 Back to Main Page</a>
      </div>
    </>
  );
}

export default GroupReviewInput;
