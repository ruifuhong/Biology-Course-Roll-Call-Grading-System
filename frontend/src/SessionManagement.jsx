import { useState, useEffect } from 'react';
import './styles/SessionManagement.css';

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
      <h3>Add {courseType === 'lecture' ? 'Lecture' : 'Discussion'} Date</h3>
      
      {semester && (
        <div className="semester-info">
          <small>📅 Valid date range for {dateRange.display}: {dateRange.min} to {dateRange.max}</small>
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
            ➕ Add Date Field
          </button>
        ) : (
          <div className="date-picker-container">
            <label>Select Date: </label>
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
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SessionDatesTable = ({ courseType, dates, onUpdate, onDelete, loading, semester }) => {
  const [editingDate, setEditingDate] = useState(null);
  const [editDate, setEditDate] = useState('');

  const sortedDates = [...dates].sort((a, b) => new Date(a.actual_date) - new Date(b.actual_date));

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
      alert('Please enter a valid date');
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
      <h3>{courseType === 'lecture' ? 'Lecture' : 'Discussion'} Dates ({dates.length})</h3>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : dates.length === 0 ? (
        <div className="no-data">No session dates set for this semester.</div>
      ) : (
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Session #</th>
              <th>Date</th>
              <th>Day of Week</th>
              <th>Attendance Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((session, index) => {
              const date = new Date(session.actual_date);
              const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
              const isActive = session.is_active;
              const currentDate = session.actual_date;
              
              return (
                <tr key={currentDate} className={isActive ? 'active-session' : 'inactive-session'}>
                  <td>Session {index + 1}</td>
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
                      session.actual_date.split('T')[0]
                    )}
                  </td>
                  <td>{dayOfWeek}</td>
                  <td>
                    <div className="attendance-status">
                      <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? '🟢 Open' : '🔴 Closed'}
                      </span>
                      <button
                        // onClick={() => onToggleAttendance(courseType, currentDate, isActive)}  // COMMENTED - function disabled
                        className={`btn btn-toggle ${isActive ? 'btn-disable' : 'btn-enable'}`}
                        title={isActive ? 'Click to disable attendance submission' : 'Click to enable attendance submission'}
                        disabled
                      >
                        {isActive ? '🔒 Close' : '🔓 Open'}
                      </button>
                    </div>
                  </td>
                  <td>
                    {editingDate === currentDate ? (
                      <div className="edit-actions">
                        <button 
                          onClick={handleSaveEdit}
                          className="btn btn-success"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="table-actions">
                        <button 
                          onClick={() => handleEditClick(session)}
                          className="btn btn-warning"
                        >
                          Edit Date
                        </button>
                        <button 
                          onClick={() => onDelete(courseType, currentDate)}
                          className="btn btn-danger"
                        >
                          Delete
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

export default function SessionManagement({ semester }) {
  const [lectureDates, setLectureDates] = useState([]);
  const [discussionDates, setDiscussionDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('lecture');

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (semester) {
      fetchSessionDates();
    }
  }, [semester]);

  const fetchSessionDates = async () => {
    setLoading(true);
    try {
      // Only fetch lecture dates - discussion functionality temporarily disabled
      const lectureResponse = await fetch(`${apiBase}/sessions/lecture-dates/${semester}`);

      if (lectureResponse.ok) {
        const lectureData = await lectureResponse.json();
        setLectureDates(lectureData);
      }

      // Discussion dates - placeholder for future implementation
      setDiscussionDates([]);
    } catch (error) {
      setMessage('Error loading session dates: ' + error.message);
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
        message: 'Invalid semester format'
      };
    }
    
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(endYear, endMonth + 1, 0);
    
    const isValid = date >= startDate && date <= endDate;
    
    return {
      isValid,
      message: isValid 
        ? 'Date is valid for this semester'
        : `Date must be between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()} for semester ${academicYear}-${semesterNum}`,
      semesterRange: {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
      }
    };
  };

  const handleSetDates = async (courseType, dates) => {
    if (!dates || dates.length === 0) {
      setMessage('Please provide at least one date');
      return;
    }

    if (courseType !== 'lecture') {
      setMessage('Discussion functionality is temporarily disabled. Focus on lectures only.');
      return;
    }

    for (const date of dates) {
      const validation = validateDateForSemester(date, semester);
      if (!validation.isValid) {
        setMessage(validation.message);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/sessions/lecture-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, dates })
      });

      if (response.ok) {
        const result = await response.json();
        setLectureDates(result);
        setMessage('Lecture dates set successfully');
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error);
      }
    } catch (error) {
      setMessage('Error setting dates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDate = async (courseType, oldDate, newDate) => {
    if (courseType !== 'lecture') {
      setMessage('Discussion functionality is temporarily disabled. Focus on lectures only.');
      return;
    }

    const validation = validateDateForSemester(newDate, semester);
    if (!validation.isValid) {
      setMessage(validation.message);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/sessions/lecture-dates/${semester}/${oldDate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualDate: newDate })
      });

      if (response.ok) {
        const updatedDate = await response.json();
        setLectureDates(lectureDates.map(d => 
          d.actual_date === oldDate ? updatedDate : d
        ));
        setMessage('Date updated successfully');
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error);
      }
    } catch (error) {
      setMessage('Error updating date: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDate = async (courseType, actualDate) => {
    if (!confirm('Are you sure you want to delete this session date?')) return;

    if (courseType !== 'lecture') {
      setMessage('Discussion functionality is temporarily disabled. Focus on lectures only.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/sessions/lecture-dates/${semester}/${actualDate}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLectureDates(lectureDates.filter(d => d.actual_date !== actualDate));
        setMessage('Session date deleted successfully');
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error);
      }
    } catch (error) {
      setMessage('Error deleting date: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // COMMENTED OUT - TOGGLE OPERATION
  // const handleToggleAttendance = async (courseType, sessionOrder, currentStatus) => {
  //   const newStatus = !currentStatus;
  //   const action = newStatus ? 'enable' : 'disable';
    
  //   if (!confirm(`Are you sure you want to ${action} attendance submission for this session?`)) return;

  //   setLoading(true);
  //   try {
  //     const endpoint = courseType === 'lecture' ? 'lecture-dates' : 'discussion-dates';
  //     const response = await fetch(`${apiBase}/sessions/${endpoint}/${semester}/${sessionOrder}/toggle`, {
  //       method: 'PATCH',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ isActive: newStatus })
  //     });

  //     if (response.ok) {
  //       const updatedSession = await response.json();
  //       if (courseType === 'lecture') {
  //         setLectureDates(lectureDates.map(d => 
  //           d.session_order === sessionOrder ? updatedSession : d
  //         ));
  //       } else {
  //         setDiscussionDates(discussionDates.map(d => 
  //           d.session_order === sessionOrder ? updatedSession : d
  //         ));
  //       }
  //       setMessage(`Attendance submission ${newStatus ? 'enabled' : 'disabled'} for Session ${sessionOrder}`);
  //     } else {
  //       const error = await response.json();
  //       setMessage('Error: ' + error.error);
  //     }
  //   } catch (error) {
  //     setMessage('Error toggling attendance: ' + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="session-management">
      <h2>Session Date Management - {semester}</h2>
      
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
          正課 (Lecture)
        </button>
        <button
          onClick={() => setActiveTab('discussion')}
          className={`course-tab-button ${activeTab === 'discussion' ? 'active' : ''}`}
        >
          討論課 (Discussion)
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
          // onToggleAttendance={handleToggleAttendance}  // COMMENTED - toggle function disabled
          loading={loading}
          semester={semester}
        />
      ) : (
        <div className="discussion-placeholder">
          <h3>討論課 (Discussion) - Coming Soon</h3>
          <p>Discussion functionality is temporarily disabled. Focus on lectures first.</p>
        </div>
      )}
    </div>
  );
}