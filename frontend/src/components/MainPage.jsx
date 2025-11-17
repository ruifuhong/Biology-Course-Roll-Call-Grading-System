import '../styles/MainPage.css';

export default function MainPage() {
  return (
    <div className="main-page">
      <div className="main-header">
        <h1>生物學課程點名系統</h1>
        <h1>Biology Course Rollcall System</h1>
        <div className="subtitle">Select your course type to submit attendance</div>
      </div>

      <div className="course-options">
        <a href="/lecture-rollcall" className="course-card">
          <h2>正課 (Lecture)</h2>
          <p>Main lecture sessions</p>
          <p>主要授課時段</p>
          <div className="time-info">
            Click to submit lecture attendance
          </div>
        </a>

        <a href="/discussion-rollcall" className="course-card">
          <h2>討論課 (Discussion)</h2>
          <p>Discussion and lab sessions</p>
          <p>討論與實驗課時段</p>
          <div className="time-info">
            Click to submit discussion attendance
          </div>
        </a>
      </div>

      <div className="info-section">
        <h3>Important Information / 重要資訊</h3>
        <ul>
          <li>Make sure to submit attendance for the correct course type / 請確保為正確的課程類型提交出席</li>
          <li>Submit attendance only once per session / 每節課僅需提交一次出席</li>
          <li>Use your registered student ID / 請使用您的註冊學號</li>
          <li>Contact instructor if you encounter any issues / 如遇問題請聯繫授課老師</li>
        </ul>
      </div>

      <div className="admin-section">
        <a href="/admin" className="admin-link">
          TA Admin Panel / 助教管理面板
        </a>
      </div>
    </div>
  );
}