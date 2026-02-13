import { useState, useEffect, useRef, useMemo } from 'react';
import '../styles/SessionManagement.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DateInputForm = ({ courseType, onSubmit, loading, semester }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getSemesterDateRange = (semester) => {
    if (!semester) return { min: '', max: '' };
    
    const academicYear = semester.substring(0, 3);
    const semesterNum = semester.substring(3);
    const year = parseInt(academicYear) + 1911;
    
    if (semesterNum === '1') {
      return {
        min: `${year}-08-01`,
        max: `${year + 1}-01-31`,
        display: `${academicYear}-1`
      };
    } else if (semesterNum === '2') {
      return {
        min: `${year + 1}-02-01`,
        max: `${year + 1}-07-31`,
        display: `${academicYear}-2`
      };
    }
    
    return { min: '', max: '', display: semester };
  };

  const dateRange = getSemesterDateRange(semester);

  const handleDateSelect = async (selectedDate) => {
    if (!selectedDate) return;
    
    await onSubmit(courseType, [selectedDate]);
    
    setShowDatePicker(false);
  };

  return (
    <div className="date-input-form">
      <h3>{courseType === 'lecture' ? '新增正課日期 Add Lecture Date' : '新增討論課日期 Add Discussion Date'}</h3>
      
      {semester && (
        <div className="semester-info">
          <small>📅 {dateRange.display} 可用日期範圍 Valid date range: {dateRange.min} 至 to {dateRange.max}</small>
        </div>
      )}
      
      <div className="helper-buttons">
        {!showDatePicker ? (
          <button 
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="btn btn-secondary"
            disabled={loading}
          >
            ➕ 新增日期 Add Date Field
          </button>
        ) : (
          <div className="date-picker-container">
            <label>選擇日期 Select Date: </label>
            <input
              type="date"
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) => handleDateSelect(e.target.value)}
              autoFocus
            />
            <button 
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="btn btn-secondary"
            >
              取消 Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function TimerCell({ courseType, session, onToggleAttendance }) {
  const { status, actual_date, opened_at, late_at } = session;
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let startTime, durationMs, timerState, nextStatus;
    if (courseType === 'lecture' && status === 'open' && opened_at) {
      startTime = new Date(opened_at);
      durationMs = 10 * 60 * 1000;
      timerState = 'open';
      nextStatus = 'closed';
    } else if (courseType === 'discussion' && status === 'open' && opened_at) {
      startTime = new Date(opened_at);
      durationMs = 10 * 60 * 1000;
      timerState = 'open';
      nextStatus = 'late';
    } else if (courseType === 'discussion' && status === 'late' && late_at) {
      startTime = new Date(late_at);
      durationMs = 50 * 60 * 1000;
      timerState = 'late';
      nextStatus = 'closed';
    } else {
      setTimeLeft(null);
      return;
    }

    function updateCountdown() {
      const elapsed = Date.now() - startTime.getTime();
      const left = durationMs - elapsed;
      setTimeLeft(left > 0 ? left : 0);
      if (left <= 0) {
        clearInterval(intervalRef.current);
        onToggleAttendance(courseType, actual_date, nextStatus);
      }
    }

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalRef.current);
  }, [courseType, status, opened_at, late_at, actual_date, onToggleAttendance]);

  if (timeLeft == null || !(status === 'open' || status === 'late')) return null;
  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return (
    <span className="lecture-timer">
      ⏳ {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

const SessionDatesTable = ({ courseType, dates, onUpdate, onDelete, onToggleAttendance, loading, semester }) => {
  const [editingDate, setEditingDate] = useState(null);
  const [editDate, setEditDate] = useState('');

  const sortedDates = useMemo(() => {
    return [...dates].sort((a, b) => new Date(a.actual_date) - new Date(b.actual_date));
  }, [dates]);

  const getSemesterDateRange = (semester) => {
    if (!semester) return { min: '', max: '' };
    const academicYear = semester.substring(0, 3);
    const semesterNum = semester.substring(3);
    const year = parseInt(academicYear) + 1911;
    if (semesterNum === '1') {
      return {
        min: `${year}-08-01`,
        max: `${year + 1}-01-31`
      };
    } else if (semesterNum === '2') {
      return {
        min: `${year + 1}-02-01`,
        max: `${year + 1}-07-31`
      };
    }
    return { min: '', max: '' };
  };

  const dateRange = getSemesterDateRange(semester);

  const handleEditClick = (session) => {
    setEditingDate(session.actual_date);
    setEditDate(session.actual_date.split('T')[0]);
  };

  const handleSaveEdit = () => {
    if (!editDate) {
      alert('請輸入有效日期 Please enter a valid date');
      return;
    }
    onUpdate(courseType, editingDate, editDate);
    setEditingDate(null);
    setEditDate('');
  };

  const handleCancelEdit = () => {
    setEditingDate(null);
    setEditDate('');
  };

  return (
    <div className="session-dates-table">
      <h3>{courseType === 'lecture' ? '正課日期 Lecture Dates' : '討論課日期 Discussion Dates'} ({dates.length})</h3>
      {loading ? (
        <div className="loading">載入中... Loading...</div>
      ) : dates.length === 0 ? (
        <div className="no-data">本學期尚未設定課程日期 No session dates set for this semester.</div>
      ) : (
        <table className="sessions-table">
          <thead>
            <tr>
              <th>場次 Session #</th>
              <th>日期 Date</th>
              <th>星期 Day of Week</th>
              <th>點名狀態 Attendance Status</th>
              <th>操作 Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((session, index) => {
              const date = new Date(session.actual_date);
              const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
              const status = session.status;
              const currentDate = session.actual_date;
              const sessionDate = session.actual_date.split('T')[0];

              let statusLabel = '';
              let statusIcon = '';
              let statusClass = '';
              if (status === 'open') {
                statusLabel = '開放中 Open';
                statusIcon = '🟢';
                statusClass = 'active';
              } else if (status === 'late') {
                statusLabel = '遲到 Late';
                statusIcon = '🟠';
                statusClass = 'late';
              } else {
                statusLabel = '關閉中 Closed';
                statusIcon = '🔴';
                statusClass = 'inactive';
              }

              let nextStatus = 'open';
              let buttonLabel = '';
              let buttonIcon = '';
              let buttonClass = '';
              if (courseType === 'lecture') {
                if (status === 'open') {
                  nextStatus = 'closed';
                  buttonLabel = '🔒 關閉點名 Close';
                  buttonIcon = '🔒';
                  buttonClass = 'btn-disable';
                } else {
                  nextStatus = 'open';
                  buttonLabel = '🔓 開放點名 Open';
                  buttonIcon = '🔓';
                  buttonClass = 'btn-enable';
                }
              } else if (courseType === 'discussion') {
                if (status === 'open') {
                  nextStatus = 'late';
                  buttonLabel = '🟠 設為遲到 Set Late';
                  buttonIcon = '🟠';
                  buttonClass = 'btn-late';
                } else if (status === 'late') {
                  nextStatus = 'closed';
                  buttonLabel = '🔒 關閉點名 Close';
                  buttonIcon = '🔒';
                  buttonClass = 'btn-disable';
                } else if (status === 'closed') {
                  nextStatus = 'open';
                  buttonLabel = '🔓 開放點名 Open';
                  buttonIcon = '🔓';
                  buttonClass = 'btn-enable';
                }
              }
              
              const today = new Date().toISOString().split('T')[0];
              const isToday = sessionDate === today;
              const dateHintLabel = sessionDate < today ? '已過期 Past session' : '未來課程 Upcoming session';

              return (
                <tr key={currentDate} className={statusClass + '-session'}>
                  <td>{index + 1}</td>
                  <td>
                    {editingDate === currentDate ? (
                      <input
                        type="date"
                        value={editDate}
                        min={dateRange.min}
                        max={dateRange.max}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="edit-date-input"
                      />
                    ) : (
                      sessionDate
                    )}
                  </td>
                  <td>{dayOfWeek}</td>
                  <td>
                    {isToday ? (
                      <div className="attendance-status">
                        <span className={`status-indicator ${statusClass}`}>
                          {statusIcon} {statusLabel}
                          <TimerCell
                            courseType={courseType}
                            session={session}
                            onToggleAttendance={onToggleAttendance}
                          />
                        </span>
                        <button
                          onClick={() => onToggleAttendance(courseType, session.actual_date, nextStatus)}
                          className={`btn btn-toggle ${buttonClass}`}
                          title={buttonLabel}
                        >
                          {buttonLabel}
                        </button>
                      </div>
                    ) : (
                      <div className="attendance-status">
                        <span className="session-date-hint no-actions">
                          {dateHintLabel}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingDate === currentDate ? (
                      <div className="edit-actions">
                        <button 
                          onClick={handleSaveEdit}
                          className="btn btn-success"
                        >
                          儲存 Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="btn btn-secondary"
                        >
                          取消 Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="table-actions">
                        <button 
                          onClick={() => handleEditClick(session)}
                          className="btn btn-warning"
                        >
                          編輯日期 Edit Date
                        </button>
                        <button 
                          onClick={() => onDelete(courseType, currentDate)}
                          className="btn btn-danger"
                        >
                          刪除 Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const TAB_KEY = 'sessionManagementActiveTab';

export default function SessionManagement({ semester }) {
  const [lectureDates, setLectureDates] = useState([]);
  const [discussionDates, setDiscussionDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(TAB_KEY) || 'lecture';
  });

  useEffect(() => {
    localStorage.setItem(TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (semester) {
      fetchSessionDates();
    }
  }, [semester]);

  const fetchSessionDates = async () => {
    setLoading(true);
    try {
      const lectureResponse = await fetch(`${apiBase}/sessions/lecture-dates/${semester}`);

      if (lectureResponse.ok) {
        const lectureData = await lectureResponse.json();
        setLectureDates(lectureData);
      }

      const discussionResponse = await fetch(`${apiBase}/sessions/discussion-dates/${semester}`);
      if (discussionResponse.ok) {
        const discussionData = await discussionResponse.json();
        setDiscussionDates(discussionData);
      } else {
        setDiscussionDates([]);
      }
    } catch (error) {
      setMessage('載入課程日期失敗 Error loading session dates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateDateForSemester = (selectedDate, semester) => {
    const date = new Date(selectedDate);
    const academicYear = semester.substring(0, 3);
    const semesterNum = semester.substring(3);
    const year = parseInt(academicYear) + 1911;
    let startMonth, endMonth, startYear, endYear;
    if (semesterNum === '1') {
      startMonth = 7;
      endMonth = 0;
      startYear = year;
      endYear = year + 1;
    } else if (semesterNum === '2') {
      startMonth = 1;
      endMonth = 6;
      startYear = year + 1;
      endYear = year + 1;
    } else {
      return {
        isValid: false,
        message: '學期格式錯誤 Invalid semester format'
      };
    }
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(endYear, endMonth + 1, 0);
    const isValid = date >= startDate && date <= endDate;
    return {
      isValid,
      message: isValid 
        ? '日期不符學期範圍 Date is valid for this semester'
        : `本學期日期在${startDate.toLocaleDateString()}與${endDate.toLocaleDateString()}之間 Date must be between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()} for semester ${academicYear}-${semesterNum}`,
      semesterRange: {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
      }
    };
  };

  const handleSetDates = async (courseType, dates) => {
    if (!dates || dates.length === 0) {
      setMessage('請至少輸入一個日期 Please provide at least one date');
      return;
    }
    for (const date of dates) {
      const validation = validateDateForSemester(date, semester);
      if (!validation.isValid) {
        setMessage('日期不符學期範圍 Invalid date for semester: ' + validation.message);
        return;
      }
    }
    setLoading(true);
    try {
      const endpoint = courseType === 'lecture' ? 'lecture-dates' : 'discussion-dates';
      const response = await fetch(`${apiBase}/sessions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, dates })
      });
      if (response.ok) {
        const result = await response.json();
        if (courseType === 'lecture') {
          setLectureDates(result);
          setMessage('正課日期設定成功 Lecture dates set successfully');
        } else {
          setDiscussionDates(result);
          setMessage('討論課日期設定成功 Discussion dates set successfully');
        }
      } else {
        const error = await response.json();
        setMessage('錯誤 Error: ' + error.error);
      }
    } catch (error) {
      setMessage('設定日期失敗 Error setting dates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDate = async (courseType, oldDate, newDate) => {
    const validation = validateDateForSemester(newDate, semester);
    if (!validation.isValid) {
      setMessage('日期不符學期範圍 Invalid date for semester: ' + validation.message);
      return;
    }
    setLoading(true);
    try {
      const endpoint = courseType === 'lecture' ? 'lecture-dates' : 'discussion-dates';
      const response = await fetch(`${apiBase}/sessions/${endpoint}/${semester}/${oldDate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualDate: newDate })
      });
      if (response.ok) {
        const updatedDate = await response.json();
        if (courseType === 'lecture') {
          setLectureDates(lectureDates.map(d => 
            d.actual_date === oldDate ? updatedDate : d
          ));
          setMessage('日期更新成功 Date updated successfully');
        } else {
          setDiscussionDates(discussionDates.map(d => 
            d.actual_date === oldDate ? updatedDate : d
          ));
          setMessage('討論課日期更新成功 Discussion date updated successfully');
        }
      } else {
        const error = await response.json();
        setMessage('錯誤 Error: ' + error.error);
      }
    } catch (error) {
      setMessage('更新日期失敗 Error updating date: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDate = async (courseType, actualDate) => {
    if (!confirm('確定刪除此課程日期？Are you sure you want to delete this session date?')) return;
    setLoading(true);
    try {
      const endpoint = courseType === 'lecture' ? 'lecture-dates' : 'discussion-dates';
      const response = await fetch(`${apiBase}/sessions/${endpoint}/${semester}/${actualDate}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (courseType === 'lecture') {
          setLectureDates(lectureDates.filter(d => d.actual_date !== actualDate));
          setMessage('課程日期刪除成功 Session date deleted successfully');
        } else {
          setDiscussionDates(discussionDates.filter(d => d.actual_date !== actualDate));
          setMessage('討論課日期刪除成功 Discussion session date deleted successfully');
        }
      } else {
        const error = await response.json();
        setMessage('錯誤 Error: ' + error.error);
      }
    } catch (error) {
      setMessage('刪除日期失敗 Error deleting date: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (courseType, selectedDate, newStatus) => {
    try {
      const endpoint = courseType === 'lecture' ? 'lecture-dates' : 'discussion-dates';
      const response = await fetch(`${apiBase}/sessions/${endpoint}/${semester}/${selectedDate}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedSession = await response.json();
        if (courseType === 'lecture') {
          setLectureDates(prev => prev.map(d => 
            d.actual_date === selectedDate ? updatedSession : d
          ));
        } else {
          setDiscussionDates(prev => prev.map(d => 
            d.actual_date === selectedDate ? updatedSession : d
          ));
        }
        setMessage(`點名狀態已${newStatus === 'open' ? '開啟' : newStatus === 'late' ? '設為遲到' : '關閉'} Attendance submission now set to ${newStatus}`);
      } else {
        const error = await response.json();
        setMessage('錯誤 Error: ' + error.error);
      }
    } catch (error) {
      setMessage('切換點名狀態失敗 Error toggling attendance: ' + error.message);
    }
  };

  return (
    <div className="session-management">
      <h2>課程日期管理 Session Date Management - {semester}</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="course-type-tabs">
        <button
          onClick={() => setActiveTab('lecture')}
          className={`course-tab-button ${activeTab === 'lecture' ? 'active' : ''}`}
        >
          正課 Lecture
        </button>
        <button
          onClick={() => setActiveTab('discussion')}
          className={`course-tab-button ${activeTab === 'discussion' ? 'active' : ''}`}
        >
          討論課 Discussion
        </button>
      </div>

      <DateInputForm 
        courseType={activeTab}
        onSubmit={handleSetDates}
        loading={loading}
        semester={semester}
      />

      {activeTab === 'lecture' ? (
        <SessionDatesTable 
          courseType={activeTab}
          dates={lectureDates}
          onUpdate={handleUpdateDate}
          onDelete={handleDeleteDate}
          onToggleAttendance={handleToggleAttendance}
          loading={loading}
          semester={semester}
        />
      ) : (
        <SessionDatesTable 
          courseType={activeTab}
          dates={discussionDates}
          onUpdate={handleUpdateDate}
          onDelete={handleDeleteDate}
          onToggleAttendance={handleToggleAttendance}
          loading={loading}
          semester={semester}
        />
      )}
    </div>
  );
}