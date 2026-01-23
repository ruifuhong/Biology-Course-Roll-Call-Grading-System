
import { pool } from './database.js';

export async function isLectureAttendanceActive(semester, actual_date) {
  try {
    const query = `SELECT status FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2;`;
    const result = await pool.query(query, [semester, actual_date]);
    const status = result.rows[0]?.status;
    return status === 'open';
  } catch (err) {
    console.error('AttendanceModel isLectureAttendanceActive error:', err);
    throw err;
  }
}

export async function isDiscussionAttendanceActive(semester, actual_date) {
  try {
    const query = `SELECT status FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2;`;
    const result = await pool.query(query, [semester, actual_date]);
    const status = result.rows[0]?.status;
    if (status === 'open' || status === 'late') {
      return true;
    }
    return false;
  } catch (err) {
    console.error('AttendanceModel isDiscussionAttendanceActive error:', err);
    throw err;
  }
}

export async function markLectureAttendance(semester, studentId, actual_date, status = 'present') {
  try {
    if (status !== 'present') {
      throw new Error('無效的出席狀態 Invalid attendance status');
    }

    const isActive = await isLectureAttendanceActive(semester, actual_date);
    if (!isActive) {
      throw new Error('尚未開放點名 Attendance submission is not currently open for this session');
    }

    const checkQuery = `SELECT * FROM "Roll-Call".attendance_lecture WHERE semester = $1 AND student_id = $2 AND actual_date = $3;`;
    const checkResult = await pool.query(checkQuery, [semester, studentId, actual_date]);
    if (checkResult.rows.length > 0) {
      throw new Error('出席已提交 Attendance has already been submitted for this session');
    }

    const query = `INSERT INTO "Roll-Call".attendance_lecture (semester, student_id, actual_date, status) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const result = await pool.query(query, [semester, studentId, actual_date, status]);
    return result.rows[0];
  } catch (err) {
    console.error('AttendanceModel markLectureAttendance error:', err);
    throw err;
  }
}

export async function markDiscussionAttendance(semester, studentId, actual_date, status) {
  try {
    if (status !== 'present' && status !== 'late') {
      throw new Error('無效的出席狀態 Invalid attendance status');
    }

    const isActive = await isDiscussionAttendanceActive(semester, actual_date);
    if (!isActive) {
      throw new Error('尚未開放點名 Attendance submission is not currently open for this session');
    }

    const checkQuery = `SELECT * FROM "Roll-Call".attendance_discussion WHERE semester = $1 AND student_id = $2 AND actual_date = $3;`;
    const checkResult = await pool.query(checkQuery, [semester, studentId, actual_date]);
    if (checkResult.rows.length > 0) {
      throw new Error('出席已提交 Attendance has already been submitted for this session');
    }

    const query = `INSERT INTO "Roll-Call".attendance_discussion (semester, student_id, actual_date, status) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const result = await pool.query(query, [semester, studentId, actual_date, status]);
    return result.rows[0];
  } catch (err) {
    console.error('AttendanceModel markDiscussionAttendance error:', err);
    throw err;
  }
}

export async function getLectureAttendance(semester, studentId) {
  try {
    const query = `SELECT * FROM "Roll-Call".attendance_lecture WHERE semester = $1 AND student_id = $2;`;
    const result = await pool.query(query, [semester, studentId]);
    return result.rows;
  } catch (err) {
    console.error('AttendanceModel getLectureAttendance error:', err);
    throw err;
  }
}

export async function getDiscussionAttendance(semester, studentId) {
  try {
    const query = `SELECT * FROM "Roll-Call".attendance_discussion WHERE semester = $1 AND student_id = $2;`;
    const result = await pool.query(query, [semester, studentId]);
    return result.rows;
  } catch (err) {
    console.error('AttendanceModel getDiscussionAttendance error:', err);
    throw err;
  }
}

export async function getAllLectureAttendance(semester) {
  try {
    const query = `SELECT s.student_id, s.name, s.department, s.group_name, a.actual_date, a.status FROM "Roll-Call".students s LEFT JOIN "Roll-Call".attendance_lecture a ON s.semester = a.semester AND s.student_id = a.student_id WHERE s.semester = $1 ORDER BY s.group_name, s.student_id, a.actual_date;`;
    const result = await pool.query(query, [semester]);
    return result.rows;
  } catch (err) {
    console.error('AttendanceModel getAllLectureAttendance error:', err);
    throw err;
  }
}

export async function getAllDiscussionAttendance(semester) {
  try {
    const query = `SELECT s.student_id, s.name, s.department, s.group_name, a.actual_date, a.status FROM "Roll-Call".students s LEFT JOIN "Roll-Call".attendance_discussion a ON s.semester = a.semester AND s.student_id = a.student_id WHERE s.semester = $1 ORDER BY s.group_name, s.student_id, a.actual_date;`;
    const result = await pool.query(query, [semester]);
    return result.rows;
  } catch (err) {
    console.error('AttendanceModel getAllDiscussionAttendance error:', err);
    throw err;
  }
}