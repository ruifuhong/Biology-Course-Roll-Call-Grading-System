import { useState, useEffect } from 'react';
import '../styles/StudentManagement.css';

export default function StudentManagement({ semester }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [csvData, setCsvData] = useState('');
  const [viewMode, setViewMode] = useState('students');
  const [courseType, setCourseType] = useState('lecture');
  const [attendanceData, setAttendanceData] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const formatSemester = (sem) => {
    if (!sem || sem.length !== 4) return sem;
    return `${sem.slice(0, 3)}-${sem.slice(3)}`;
  };

  useEffect(() => {
    if (semester) {
      if (viewMode === 'students') {
        fetchStudents();
      } else {
        fetchAttendanceData();
      }
    }
  }, [semester, viewMode, courseType]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/students/${semester}`);
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a, b) => {
          const groupA = a.group_name || '';
          const groupB = b.group_name || '';
          return groupA.localeCompare(groupB);
        });
        setStudents(sortedData);
      } else {
        setMessage('Failed to load students / 載入學生失敗');
      }
    } catch (error) {
      setMessage('Error loading students: ' + error.message + ' / 載入學生錯誤: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddStudent = async (studentData) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentData, semester })
      });

      if (response.ok) {
        const newStudent = await response.json();
        const updatedStudents = [...students, newStudent];
        const sortedStudents = updatedStudents.sort((a, b) => {
          const groupA = a.group_name || '';
          const groupB = b.group_name || '';
          return groupA.localeCompare(groupB);
        });
        setStudents(sortedStudents);
        setMessage('Student added successfully / 學生新增成功');
        setShowAddForm(false);
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error + ' / 錯誤: ' + error.error);
      }
    } catch (error) {
      setMessage('Error adding student: ' + error.message + ' / 新增學生錯誤: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvData.trim()) {
      setMessage('Please provide CSV data / 請提供CSV資料');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/students/upload-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData, semester })
      });

      if (response.ok) {
        const result = await response.json();
        const successful = result.summary.created || 0;
        const failed = (result.summary.parseErrors || 0) + (result.summary.dbErrors || 0);
        setMessage(`CSV upload completed: ${successful} successful, ${failed} failed / CSV上傳完成: ${successful} 成功, ${failed} 失敗`);
        setCsvData('');
        fetchStudents();
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error + ' / 錯誤: ' + error.error);
      }
    } catch (error) {
      setMessage('Error uploading CSV: ' + error.message + ' / CSV上傳錯誤: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editFormData.student_id || !editFormData.name || !editFormData.department || !editFormData.group_name) {
      alert('Student ID, Name, Department, and Group Name are required / 學號、姓名、系別和組別為必填欄位');
      return;
    }

    setLoading(true);
    try {
      const originalStudentId = students.find(s => s.student_id === editingStudentId)?.student_id;
      const response = await fetch(`${apiBase}/students/${semester}/${originalStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        const updatedStudents = students.map(student => 
          student.student_id === originalStudentId ? updatedStudent : student
        );
        const sortedStudents = updatedStudents.sort((a, b) => {
          const groupA = a.group_name || '';
          const groupB = b.group_name || '';
          return groupA.localeCompare(groupB);
        });
        setStudents(sortedStudents);
        setMessage('Student updated successfully / 學生更新成功');
        setEditingStudentId(null);
        setEditFormData({});
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error + ' / 錯誤: ' + error.error);
      }
    } catch (error) {
      setMessage('Error updating student: ' + error.message + ' / 更新學生錯誤: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? / 確定要刪除此學生嗎？')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/students/${semester}/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStudents(students.filter(student => student.student_id !== studentId));
        setMessage('Student deleted successfully / 學生刪除成功');
      } else {
        const error = await response.json();
        setMessage('Error: ' + error.error + ' / 錯誤: ' + error.error);
      }
    } catch (error) {
      setMessage('Error deleting student: ' + error.message + ' / 刪除學生錯誤: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditStudent = (student) => {
    setEditingStudentId(student.student_id);
    setEditFormData({
      student_id: student.student_id,
      name: student.name,
      department: student.department,
      group_name: student.group_name
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
    setEditFormData({});
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="student-management">
      <h2>Student Management - {semester} / 學生管理 - {semester}</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="view-mode-tabs" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setViewMode('students')}
          className={`btn ${viewMode === 'students' ? 'btn-primary' : 'btn-secondary'}`}
        >
          👥 Manage Students / 管理學生
        </button>
        <button
          onClick={() => setViewMode('attendance')}
          className={`btn ${viewMode === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📊 View Attendance / 查看出席
        </button>
      </div>

      {viewMode === 'attendance' && (
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
      )}

      {viewMode === 'students' && (
        <div className="action-buttons" style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingStudentId(null);
              setEditFormData({});
            }}
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showAddForm ? 'Cancel / 取消' : 'Add Student / 新增學生'}
          </button>
          {editingStudentId && (
            <button 
              onClick={cancelEdit}
              className="btn btn-secondary"
            >
              Cancel Edit / 取消編輯
            </button>
          )}
          <button 
            onClick={fetchStudents}
            className="btn btn-secondary"
          >
            Refresh / 重新整理
          </button>
        </div>
      )}

      {viewMode === 'students' && (
        <>
          {showAddForm && (
            <StudentForm 
              onSubmit={handleAddStudent}
              onCancel={() => setShowAddForm(false)}
              semester={semester}
              mode="add"
            />
          )}

          <div className="csv-upload-section">
            <h3>{formatSemester(semester)} CSV Upload / CSV上傳</h3>
            <p>Format: student_id,name,department,group_name / 格式: 學號,姓名,系別,組別</p>
            <div className="file-input-wrapper">
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste CSV data here... / 在此貼上CSV資料..."
              />
            </div>
            <button 
              onClick={handleCSVUpload}
              disabled={loading || !csvData.trim()}
              className="btn btn-success"
            >
              {loading ? 'Uploading... / 上傳中...' : 'Upload CSV Data / 上傳CSV資料'}
            </button>
          </div>

          <div className="data-table-container">
            <h3>Current Students ({students.length}) / 目前學生 ({students.length})</h3>
            {loading ? (
              <div className="loading">Loading students... / 載入學生中...</div>
            ) : students.length === 0 ? (
              <div className="no-data">No students found for this semester. / 本學期未找到學生。</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Group / 組別</th>
                    <th>Student ID / 學號</th>
                    <th>Name / 姓名</th>
                    <th>Department / 系別</th>
                    <th>Actions / 操作</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const isEditing = editingStudentId === student.student_id;
                    return (
                      <tr key={student.student_id}>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.group_name || ''}
                              onChange={(e) => handleEditInputChange('group_name', e.target.value)}
                              className="table-input"
                            />
                          ) : (
                            student.group_name || 'N/A'
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.student_id || ''}
                              onChange={(e) => handleEditInputChange('student_id', e.target.value)}
                              className="table-input"
                            />
                          ) : (
                            student.student_id
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.name || ''}
                              onChange={(e) => handleEditInputChange('name', e.target.value)}
                              className="table-input"
                            />
                          ) : (
                            student.name
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.department || ''}
                              onChange={(e) => handleEditInputChange('department', e.target.value)}
                              className="table-input"
                            />
                          ) : (
                            student.department
                          )}
                        </td>
                        <td>
                          <div className="action-buttons-inline">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleEditStudent}
                                  className="btn btn-sm btn-success"
                                  disabled={loading}
                                >
                                  Save / 儲存
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="btn btn-sm btn-secondary"
                                  disabled={loading}
                                >
                                  Cancel / 取消
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditStudent(student)}
                                  className="btn btn-sm btn-primary"
                                  disabled={loading || editingStudentId !== null}
                                >
                                  Edit / 編輯
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student.student_id)}
                                  className="btn btn-sm btn-danger"
                                  disabled={loading || editingStudentId !== null}
                                >
                                  Delete / 刪除
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {viewMode === 'attendance' && (
        <AttendanceTable 
          attendanceData={attendanceData}
          sessionDates={sessionDates}
          courseType={courseType}
          loading={loading}
          onRefresh={fetchAttendanceData}
        />
      )}
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
    <div className="attendance-view">
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

function StudentForm({ onSubmit, onCancel, semester, mode = 'add', initialData = null }) {
  const [formData, setFormData] = useState({
    student_id: initialData?.student_id || '',
    name: initialData?.name || '',
    department: initialData?.department || '',
    group_name: initialData?.group_name || ''
  });

  const formatSemester = (sem) => {
    if (!sem || sem.length !== 4) return sem;
    return `${sem.slice(0, 3)}-${sem.slice(3)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.department || !formData.group_name) {
      alert('Student ID, Name, Department, and Group Name are required / 學號、姓名、系別和組別為必填欄位');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-section">
      <h3>{formatSemester(semester)} {mode === 'edit' ? 'Edit Student / 編輯學生' : 'Add New Student / 新增學生'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Student ID / 學號 *</label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              disabled={mode === 'edit'}
              required
            />
            {mode === 'edit' && <small>Student ID cannot be changed / 學號無法修改</small>}
          </div>
          <div className="form-group">
            <label>Name / 姓名 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Department / 系別 *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Group Name / 組別 *</label>
            <input
              type="text"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="action-buttons">
          <button type="submit" className="btn btn-success">
            {mode === 'edit' ? 'Update Student / 更新學生' : 'Add Student / 新增學生'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel / 取消
          </button>
        </div>
      </form>
    </div>
  );
}