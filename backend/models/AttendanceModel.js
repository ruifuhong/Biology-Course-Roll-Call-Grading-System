
import { pool } from './database.js';

export async function isLectureAttendanceActive(semester, sessionOrder) {
  const query = `
    SELECT is_active FROM "Roll-Call".lecture_dates 
    WHERE semester = $1 AND session_order = $2;
  `;
  const result = await pool.query(query, [semester, sessionOrder]);
  return result.rows[0]?.is_active || false;
}

export async function isDiscussionAttendanceActive(semester, actual_date) {
  const query = `
    SELECT is_active FROM "Roll-Call".discussion_dates 
    WHERE semester = $1 AND actual_date = $2;
  `;
  const result = await pool.query(query, [semester, actual_date]);
  return result.rows[0]?.is_active || false;
}

export async function markLectureAttendance(semester, studentId, actual_date, status = 'present') {
  const queryActive = `SELECT is_active FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2;`;
  const resultActive = await pool.query(queryActive, [semester, actual_date]);
  const isActive = resultActive.rows[0]?.is_active || false;
  if (!isActive) {
    throw new Error('尚未開放點名 Attendance submission is not currently open for this session');
  }

  const checkQuery = `
    SELECT * FROM "Roll-Call".attendance_lecture
    WHERE semester = $1 AND student_id = $2 AND actual_date = $3;
  `;
  const checkResult = await pool.query(checkQuery, [semester, studentId, actual_date]);
  if (checkResult.rows.length > 0) {
    throw new Error('出席已提交 Attendance has already been submitted for this session');
  }

  const query = `
    INSERT INTO "Roll-Call".attendance_lecture (semester, student_id, actual_date, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [semester, studentId, actual_date, status]);
  return result.rows[0];
}

export async function markDiscussionAttendance(semester, studentId, actual_date, status = 'present') {
  const isActive = await isDiscussionAttendanceActive(semester, actual_date);
  if (!isActive) {
    throw new Error('尚未開放點名 Attendance submission is not currently open for this session');
  }

  const checkQuery = `
    SELECT * FROM "Roll-Call".attendance_discussion
    WHERE semester = $1 AND student_id = $2 AND actual_date = $3;
  `;
  const checkResult = await pool.query(checkQuery, [semester, studentId, actual_date]);
  if (checkResult.rows.length > 0) {
    throw new Error('出席已提交 Attendance has already been submitted for this session');
  }

  const query = `
    INSERT INTO "Roll-Call".attendance_discussion (semester, student_id, actual_date, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [semester, studentId, actual_date, status]);
  return result.rows[0];
}

export async function getLectureAttendance(semester, studentId) {
  const query = `
    SELECT * FROM "Roll-Call".attendance_lecture 
    WHERE semester = $1 AND student_id = $2;
  `;
  const result = await pool.query(query, [semester, studentId]);
  return result.rows;
}

export async function getDiscussionAttendance(semester, studentId) {
  const query = `
    SELECT * FROM "Roll-Call".attendance_discussion 
    WHERE semester = $1 AND student_id = $2;
  `;
  const result = await pool.query(query, [semester, studentId]);
  return result.rows;
}

export async function getAllLectureAttendance(semester) {
  const query = `
    SELECT s.student_id, s.name, s.department, s.group_name, a.actual_date, a.status
    FROM "Roll-Call".students s
    LEFT JOIN "Roll-Call".attendance_lecture a
      ON s.semester = a.semester AND s.student_id = a.student_id
    WHERE s.semester = $1
    ORDER BY s.group_name, s.student_id, a.actual_date;
  `;
  const result = await pool.query(query, [semester]);
  return result.rows;
}

export async function getAllDiscussionAttendance(semester) {
  const query = `
    SELECT s.student_id, s.name, s.department, s.group_name, a.actual_date, a.status
    FROM "Roll-Call".students s
    LEFT JOIN "Roll-Call".attendance_discussion a
      ON s.semester = a.semester AND s.student_id = a.student_id
    WHERE s.semester = $1
    ORDER BY s.group_name, s.student_id, a.actual_date;
  `;
  const result = await pool.query(query, [semester]);
  return result.rows;
}