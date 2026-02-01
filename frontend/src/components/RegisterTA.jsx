import { useState, useEffect } from 'react';
import { generateSemesterOptions } from '../utils/semesterUtils';
import '../styles/RegisterTA.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RegisterTA({ onRegister }) {
  const [registerMethod, setRegisterMethod] = useState('google');
  const [email, setEmail] = useState('');  
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [registerSemesters, setRegisterSemesters] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tas, setTAs] = useState([]);
  const [loadingTAs, setLoadingTAs] = useState(true);
  const [editStates, setEditStates] = useState({});
  const semesterOptions = generateSemesterOptions();


  const fetchTAs = async () => {
    setLoadingTAs(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/ta-list`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Each TA: { id, username, name, semesters }
        setTAs(data.tas);
        // Initialize edit states
        const editInit = {};
        data.tas.forEach(ta => {
          editInit[ta.id] = { editing: false, name: ta.name, username: ta.username, semesters: [...(ta.semesters || [])] };
        });
        setEditStates(editInit);
      } else {
        setTAs([]);
      }
    } catch {
      setTAs([]);
    } finally {
      setLoadingTAs(false);
    }
  };

  const handleSemesterToggleRegister = (semester) => {
    setRegisterSemesters(prev =>
      prev.includes(semester)
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  };

  const handleGoogleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  const fullEmail = email.includes('@') ? email : `${email}@g.nccu.edu.tw`;

  try {
    const response = await fetch(`${apiBase}/api/admin/add-google-ta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        email: fullEmail,
        semesters: registerSemesters 
      })
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(`成功授權：${fullEmail}`);
      setEmail('');
      setRegisterSemesters([]);
      fetchTAs(); 
    } else {
      setError(data.error || '授權失敗');
    }
  } catch (err) {
    setError('連線失敗');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const defaultPassword = username + username;
      const response = await fetch(`${apiBase}/api/admin/add-ta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, name, semesters: registerSemesters, password: defaultPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('助教帳號建立成功！TA account created successfully!');
        setUsername('');
        setName('');
        setRegisterSemesters([]);
        onRegister && onRegister(data.user);
      } else {
        setError(data.error || '註冊失敗 Registration failed');
      }
      fetchTAs();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id) => {
    setEditStates(prev => ({ ...prev, [id]: { ...prev[id], editing: true } }));
  };

  const handleCancel = (id) => {
    const ta = tas.find(t => t.id === id);
    setEditStates(prev => ({
      ...prev,
      [id]: {
        editing: false,
        name: ta.name,
        username: ta.username,
        semesters: [...ta.semesters]
      }
    }));
  };

  const handleEditChange = (id, field, value) => {
    setEditStates(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };
  
  const handleSemesterToggle = (id, semester) => {
    setEditStates(prev => {
      const current = prev[id].semesters || [];
      const newSemesters = current.includes(semester)
        ? current.filter(s => s !== semester)
        : [...current, semester];
      return { ...prev, [id]: { ...prev[id], semesters: newSemesters } };
    });
  };

  const handleSave = async (id) => {
    const { name, username, semesters } = editStates[id];

    const ta = tas.find(t => t.id === id);
    const isNameChanged = name !== ta.name;
    const isUsernameChanged = username !== ta.username;
    const oldSem = (ta.semesters || []).slice().sort();
    const newSem = (Array.isArray(semesters) ? semesters : []).slice().sort();
    const isSemChanged = oldSem.length !== newSem.length || oldSem.some((v, i) => v !== newSem[i]);
    if (!isNameChanged && !isUsernameChanged && !isSemChanged) {
      setSuccess('沒有變更，未送出 No changes to save.');
      setEditStates(prev => ({ ...prev, [id]: { ...prev[id], editing: false } }));
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${apiBase}/api/admin/update-ta/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, username, semesters })
      });
      if (response.ok) {
         setTAs(prev => prev.map(ta =>
          ta.id === id
            ? { ...ta, name, username, semesters }
            : ta
        ));
        setEditStates(prev => ({ ...prev, [id]: { ...prev[id], editing: false } }));
        setSuccess('編輯成功 Saved successfully!');
      } else {
        const data = await response.json();
        setError(data.error || '編輯失敗 Failed to save changes');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定刪除此助教？Are you sure you want to delete this TA?')) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/remove-ta/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setSuccess('助教刪除成功！TA deleted successfully!');
        setError('');
        fetchTAs();
      } else {
        const data = await res.json();
        setError(data.error || '刪除失敗 Delete failed');
      }
    } catch {
      setError(err);
    }
  };

  useEffect(() => {
    fetchTAs();
  },[]);

  useEffect(() => {
    setRegisterSemesters([]);
  }, [registerMethod]);

  return (
    <div className="register-ta-container">
      <h2>註冊助教 Register TA</h2>
      <div className="register-ta-method-tabs">
        <button
          className={registerMethod === 'google' ? 'active' : ''}
          onClick={() => setRegisterMethod('google')}
        >
          使用 Google 帳號註冊 Register with Google
        </button>
        <button
          className={registerMethod === 'legacy' ? 'active' : ''}
          onClick={() => setRegisterMethod('legacy')}
        >
          使用帳號密碼註冊 Register with Username/Password
        </button>
      </div>
      {registerMethod === 'google' ? (
        <form onSubmit={handleGoogleSubmit} className="register-ta-form google-active">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            type="text"
            placeholder="助教學號 TA's Student ID"
            className="register-ta-input register-ta-email"
          />@g.nccu.edu.tw
          <div className="register-ta-semester-toggle-group">
            {semesterOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={
                  'register-ta-semester-btn' +
                  (registerSemesters.includes(opt.value) ? ' selected' : '')
                }
                onClick={() => handleSemesterToggleRegister(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading} className="register-ta-submit-btn">
            {loading ? '註冊中... Registering...' : '註冊 Register'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="register-ta-form">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="帳號 Username"
            className="register-ta-input register-ta-username"
          />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="助教姓名 TA Name"
            className="register-ta-input register-ta-name"
          />
          <div className="register-ta-semester-toggle-group">
            {semesterOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={
                  'register-ta-semester-btn' +
                  (registerSemesters.includes(opt.value) ? ' selected' : '')
                }
                onClick={() => handleSemesterToggleRegister(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading} className="register-ta-submit-btn">
            {loading ? '註冊中... Registering...' : '註冊 Register'}
          </button>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <h3>目前助教 Current TAs</h3>
      {loadingTAs ? (
        <div>載入助教名單中... Loading TA list...</div>
      ) : (
        <div className="ta-list-table">
          <div className="ta-list-header">
            <div className="ta-list-name">姓名 Name</div>
            <div className="ta-list-username">帳號 Username</div>
            <div className="ta-list-semesters">學期 Semesters</div>
            <div className="ta-list-actions">操作 Actions</div>
          </div>
          {tas.length === 0 && <div className="ta-list-empty">找不到助教 No TAs found.</div>}
          {tas.map(ta => {
            const isEditing = editStates[ta.id]?.editing;
            return (
              <div key={ta.id} className="ta-list-row">
                <div className="ta-list-name">
                  {isEditing ? (
                    <input
                      value={editStates[ta.id]?.name || ''}
                      onChange={e => handleEditChange(ta.id, 'name', e.target.value)}
                      placeholder="助教名字 TA Name"
                    />
                  ) : (
                    <span>{ta.name || ta.username}</span>
                  )}
                </div>
                <div className="ta-list-username">
                  {isEditing ? (
                    <input
                      value={editStates[ta.id]?.username || ''}
                      onChange={e => handleEditChange(ta.id, 'username', e.target.value)}
                      placeholder="助教帳號 TA Username"
                    />
                  ) : (
                    <span>{ta.username}</span>
                  )}
                </div>
                <div className="ta-list-semesters">
                  {isEditing ? (
                    semesterOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={
                          'ta-semester-toggle-btn' +
                          (editStates[ta.id]?.semesters?.includes(opt.value) ? ' selected' : '')
                        }
                        onClick={() => handleSemesterToggle(ta.id, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))
                  ) : (
                    ta.semesters && ta.semesters.length > 0 ? (
                      ta.semesters.map(s => {
                        const label = semesterOptions.find(opt => opt.value === s)?.label || s;
                        return (
                          <span key={s} className="ta-semester-chip">{label}</span>
                        );
                      })
                    ) : <span className="ta-semester-none">無指定學期 No semesters</span>
                  )}
                </div>
                <div className="ta-list-actions">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(ta.id)} className="ta-action-btn save-btn">儲存 Save</button>
                      <button onClick={() => handleCancel(ta.id)} className="ta-action-btn cancel-btn">取消 Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditClick(ta.id)} className="ta-action-btn edit-btn">編輯 Edit</button>
                  )}
                  <button onClick={() => handleDelete(ta.id)} className="delete-btn ta-action-btn">刪除 Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
