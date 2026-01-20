import { useState, useEffect } from 'react';
import { naturalSort } from '../utils/sortUtils';
import '../styles/StudentManagement.css';

export default function ScoreView({ semester }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [scoreData, setScoreData] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (semester) {
      fetchScoreData();
    }
  }, [semester]);

  const fetchScoreData = async () => {
    setLoading(true);
    try {
      const [studentsRes, intraRes, interRes, datesRes, attendanceRes] = await Promise.all([
        fetch(`${apiBase}/students/${semester}`),
        fetch(`${apiBase}/review/intra/summary/${semester}`),
        fetch(`${apiBase}/review/inter/summary/${semester}`),
        fetch(`${apiBase}/sessions/discussion-dates/${semester}`),
        fetch(`${apiBase}/attendance/discussion/${semester}`)
      ]);
      if (!studentsRes.ok || !intraRes.ok || !interRes.ok || !datesRes.ok || !attendanceRes.ok) {
        setMessage('載入資料失敗 Failed to load data');
        setLoading(false);
        return;
      }
      const students = await studentsRes.json();
      const intraSummary = await intraRes.json();
      const interSummary = await interRes.json();
      const sessionDates = await datesRes.json();
      const attendance = await attendanceRes.json();

      const intraMap = {};
      intraSummary.forEach(item => {
        if (!intraMap[item.student_id]) intraMap[item.student_id] = {};
        intraMap[item.student_id][item.actual_date] = item.avg_score;
        });
      const interMap = {};
      interSummary.forEach(item => {
        if (!interMap[item.reviewee_group_id]) interMap[item.reviewee_group_id] = {};
        interMap[item.reviewee_group_id][item.actual_date] = item.avg_score;
        });
      const attendanceMap = {};
      attendance.forEach(item => {
        if (!attendanceMap[item.student_id]) attendanceMap[item.student_id] = {};
        attendanceMap[item.student_id][item.actual_date] = item.status;
      });

      const mergedData = students.map(student => {
        const scores = {};
        let personalSum = 0, groupSum = 0, personalCount = 0, groupCount = 0;
        let absent = 0, late = 0;
        sessionDates.forEach(session => {
          const date = session.actual_date;
          const personal = intraMap[student.student_id]?.[date];
          const group = interMap[student.group_name]?.[date];
          scores[date] = {
            personal: typeof personal === 'number' ? personal : 0,
            group: typeof group === 'number' ? group : 0
          };
          if (typeof personal === 'number') {
            personalSum += personal;
            personalCount++;
          }
          if (typeof group === 'number') {
            groupSum += group;
            groupCount++;
          }
          const attStatus = attendanceMap[student.student_id]?.[date];
          if (!attStatus) absent++;
          if (attStatus === 'late') late++;
        });
        return {
          ...student,
          scores,
          personalAvg: personalCount ? (personalSum / personalCount).toFixed(2) : '0',
          groupAvg: groupCount ? (groupSum / groupCount).toFixed(2) : '0',
          absent,
          late
        };
      });
      setScoreData(mergedData);
      setSessionDates(sessionDates);
    } catch (error) {
      setMessage('載入資料錯誤 Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="score-view">
      <div className="attendance-header">
        <h3>評分總覽 Score Overview</h3>
        <button onClick={fetchScoreData} className="btn btn-secondary" disabled={loading}>
          {loading ? '載入中... Loading...' : '🔄 重新整理 Refresh'}
        </button>
      </div>
      {message && (
        <div className={`message ${message.includes('錯誤') || message.includes('失敗') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th rowSpan="2">組別 Group</th>
              <th rowSpan="2">學號 Student ID</th>
              <th rowSpan="2">系級 Department</th>
              <th rowSpan="2">姓名 Name</th>
              {sessionDates.map((session) => (
                <th key={session.actual_date} colSpan="2">
                  {new Date(session.actual_date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                </th>
              ))}
              <th rowSpan="2">個人學期平均<br/>Personal Total Avg</th>
              <th rowSpan="2">小組學期平均<br/>Group Total Avg</th>
              <th rowSpan="2">缺席<br/>Absent</th>
              <th rowSpan="2">遲到<br/>Late</th>
            </tr>
            <tr>
              {sessionDates.map((session) => [
                <th key={session.actual_date + '-personal'}>個人<br/>Personal</th>,
                <th key={session.actual_date + '-group'}>小組<br/>Group</th>
              ])}
            </tr>
          </thead>
          <tbody>
            {scoreData.length === 0 ? (
              <tr>
                <td colSpan={4 + sessionDates.length * 2 + 4} className="no-data">尚無評分資料 No score data available</td>
              </tr>
            ) : (
              [...scoreData].sort(naturalSort).map(student => (
                <tr key={student.student_id}>
                  <td>{student.group_name || 'N/A'}</td>
                  <td>{student.student_id}</td>
                  <td>{student.department}</td>
                  <td>{student.name}</td>
                  {sessionDates.map(session => [
                    <td key={student.student_id + '-' + session.actual_date + '-personal'}>
                      {student.scores?.[session.actual_date]?.personal}
                    </td>,
                    <td key={student.student_id + '-' + session.actual_date + '-group'}>
                      {student.scores?.[session.actual_date]?.group}
                    </td>
                  ])}
                  <td>{student.personalAvg}</td>
                  <td>{student.groupAvg}</td>
                  <td>{student.absent}</td>
                  <td>{student.late}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
