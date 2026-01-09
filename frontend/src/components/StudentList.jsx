import { useState, useEffect } from 'react';
import { naturalSort } from '../utils/sortUtils';
import '../styles/StudentManagement.css';

export default function StudentList({ semester }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [csvData, setCsvData] = useState('');

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const formatSemester = (sem) => {
    if (!sem || sem.length !== 4) return sem;
    return `${sem.slice(0, 3)}-${sem.slice(3)}`;
  };

  useEffect(() => {
    if (semester) {
      fetchStudents();
    }
  }, [semester]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/students/${semester}`);
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort(naturalSort);
        setStudents(sortedData);
      } else {
        setMessage('載入學生失敗 Failed to load students');
      }
    } catch (error) {
      setMessage('載入學生錯誤: ' + error.message + ' Error loading students: ' + error.message);
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
        const sortedStudents = updatedStudents.sort(naturalSort);
        setStudents(sortedStudents);
        setMessage('新增學生成功 Student added successfully');
        setShowAddForm(false);
      } else {
        const error = await response.json();
        setMessage('錯誤:' + error.error + ' Error: ' + error.error);
      }
    } catch (error) {
      setMessage(' 新增學生錯誤: ' + error.message + ' Error adding student: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvData.trim()) {
      setMessage('請提供CSV資料 Please provide CSV data');
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
        setMessage(`CSV上傳完成: ${successful} 成功, ${failed} 失敗 CSV upload completed: ${successful} successful, ${failed} failed`);
        setCsvData('');
        fetchStudents();
      } else {
        const error = await response.json();
        setMessage('錯誤: ' + error.error + ' Error: ' + error.error);
      }
    } catch (error) {
      setMessage('CSV上傳錯誤: ' + error.message + ' Error uploading CSV: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editFormData.student_id || !editFormData.name || !editFormData.department || !editFormData.group_name) {
      alert('學號、姓名、系別和組別為必填欄位 Student ID, Name, Department, and Group Name are required');
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
        const sortedStudents = updatedStudents.sort(naturalSort);
        setStudents(sortedStudents);
        setMessage('更新學生成功 Student updated successfully');
        setEditingStudentId(null);
        setEditFormData({});
      } else {
        const error = await response.json();
        setMessage('錯誤: ' + error.error + ' Error: ' + error.error);
      }
    } catch (error) {
      setMessage('更新學生錯誤: ' + error.message + ' Error updating student: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('確定要刪除此學生嗎？Are you sure you want to delete this student?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/students/${semester}/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStudents(students.filter(student => student.student_id !== studentId));
        setMessage('學生刪除成功 Student deleted successfully');
      } else {
        const error = await response.json();
        setMessage('錯誤: ' + error.error + ' Error: ' + error.error);
      }
    } catch (error) {
      setMessage('刪除學生錯誤:' + error.message + ' Error deleting student: ' + error.message);
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
    <div className="student-list">
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="action-buttons margin-bottom-20">
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingStudentId(null);
            setEditFormData({});
          }}
          className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showAddForm ? '取消 Cancel' : '新增學生 Add Student'}
        </button>
        {editingStudentId && (
          <button 
            onClick={cancelEdit}
            className="btn btn-secondary"
          >
            取消編輯 Cancel Edit
          </button>
        )}
        <button 
          onClick={fetchStudents}
          className="btn btn-secondary"
        >
          重新整理 Refresh
        </button>
      </div>

      {showAddForm && (
        <StudentForm 
          onSubmit={handleAddStudent}
          onCancel={() => setShowAddForm(false)}
          semester={semester}
          mode="add"
        />
      )}

      <div className="csv-upload-section">
        <h3>{formatSemester(semester)} CSV上傳 CSV Upload</h3>
        <p>格式: 學號,姓名,系別,組別 Format: student_id,name,department,group_name</p>
        <div className="file-input-wrapper">
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="在此貼上CSV資料... Paste CSV data here..."
          />
        </div>
        <button 
          onClick={handleCSVUpload}
          disabled={loading || !csvData.trim()}
          className="btn btn-success"
        >
          {loading ? '上傳中... Uploading...' : '上傳CSV資料 Upload CSV Data'}
        </button>
      </div>

      <div className="data-table-container">
        <h3>目前學生  ({students.length}) Current Students ({students.length})</h3>
        {loading ? (
          <div className="loading">載入學生中... Loading students...</div>
        ) : students.length === 0 ? (
          <div className="no-data">本學期未找到學生 No students found for this semester. </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>組別 Group </th>
                <th>學號 Student ID </th>
                <th>姓名 Name </th>
                <th>系別 Department </th>
                <th>操作 Actions </th>
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
                              儲存 Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn btn-sm btn-secondary"
                              disabled={loading}
                            >
                              取消 Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditStudent(student)}
                              className="btn btn-sm btn-primary"
                              disabled={loading || editingStudentId !== null}
                            >
                              編輯 Edit 
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.student_id)}
                              className="btn btn-sm btn-danger"
                              disabled={loading || editingStudentId !== null}
                            >
                              刪除 Delete 
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
      alert('學號、姓名、系別和組別為必填欄位 Student ID, Name, Department, and Group Name are required');
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
      <h3>{formatSemester(semester)} {mode === 'edit' ? '編輯學生 Edit Student' : '新增學生 Add New Student'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="student_id_input">學號 Student ID*</label>
            <input
              id="student_id_input"
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              disabled={mode === 'edit'}
              required
            />
            {mode === 'edit' && <small>學號無法修改 Student ID cannot be changed</small>}
          </div>
          <div className="form-group">
            <label htmlFor="student_name_input">姓名 Name*</label>
            <input
              id="student_name_input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="student_department_input">系級 Department*</label>
            <input
              id="student_department_input"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="group_name_input">組別 Group Name*</label>
            <input
              id="group_name_input"
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
            {mode === 'edit' ? '更新學生 Update Student' : '新增學生 Add Student'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            取消 Cancel 
          </button>
        </div>
      </form>
    </div>
  );
}