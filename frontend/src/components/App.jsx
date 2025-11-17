import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LectureRollcall from './LectureRollcall';
import DiscussionRollcall from './DiscussionRollcall';
import AdminDashboard from './AdminDashboard';
import '../App.css';

function MainPage() {
  return (
    <>
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