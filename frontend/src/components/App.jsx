import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react'
import CrudTest from './CrudTest.jsx'
import FeedbackForm from './FeedbackForm.jsx'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import LectureRollcall from './LectureRollcall';
import DiscussionRollcall from './DiscussionRollcall';
import AdminDashboard from './AdminDashboard';
import '../App.css';

function MainPage() {
  const [count, setCount] = useState(0)
  const [hello, setHello] = useState('')

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBase}/hello`)
      .then((r) => r.json())
      .then((data) => setHello(data.message))
      .catch(() => setHello(''))
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {hello && <p>Backend says: {hello}</p>}
      <FeedbackForm />
      <h1>-------</h1>
      <CrudTest />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
      {/* Rollcall System Links */}
      <div style={{ margin: '30px 0', padding: '20px', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h2 style={{ color: '#007bff' }}>🎓 Biology Course Rollcall System</h2>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px' }}>
          <a 
            href="/lecture-rollcall" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            正課 Lecture Rollcall
          </a>
          <a 
            href="/discussion-rollcall" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            討論課 Discussion Rollcall
          </a>
          <a 
            href="/admin" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Admin Panel
          </a>
        </div>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/lecture-rollcall" element={<LectureRollcall />} />
        <Route path="/discussion-rollcall" element={<DiscussionRollcall />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;