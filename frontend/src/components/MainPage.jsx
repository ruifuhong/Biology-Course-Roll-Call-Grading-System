import '../styles/MainPage.css';

export default function MainPage() {
  return (
    <div className="main-page">
      <div className="main-header">
        <h1>生物學課程點名系統 Biology Course Rollcall System</h1>
        <div className="subtitle">請選擇課程類型以提交出席 Select your course type to submit attendance</div>
      </div>

      <div className="course-options">
        <a href="/lecture-rollcall" className="course-card">
          <h2>正課 (Lecture)</h2>
          <p>主要授課時段 Main lecture sessions</p>
          <div className="time-info">
            點擊提交正課出席 Click to submit lecture attendance
          </div>
        </a>

        <a href="/discussion-rollcall" className="course-card">
          <h2>討論課 (Discussion)</h2>
          <p>討論與實驗課時段 Discussion and lab sessions</p>
          <div className="time-info">
            點擊提交討論課出席 Click to submit discussion attendance
          </div>
        </a>
      </div>

      <div className="info-section">
        <h3>重要資訊 Important Information</h3>
        <ul>
          <li>請確保為正確的課程類型提交出席 Make sure to submit attendance for the correct course type</li>
          <li>每節課僅需提交一次出席 Submit attendance only once per session</li>
          <li>請使用您的註冊學號 Use your registered student ID</li>
          <li>如遇問題請聯繫授課老師 Contact instructor if you encounter any issues</li>
        </ul>
      </div>

      <div className="admin-section">
        <a href="/admin" className="admin-link">
          助教管理面板 TA Admin Panel
        </a>
      </div>
    </div>
  );
}