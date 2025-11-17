import { pool } from './database.js';

class AttendanceModel {
  static async isLectureAttendanceActive(semester, sessionOrder) {
    const query = `
      SELECT is_active FROM "Roll-Call".lecture_dates 
      WHERE semester = $1 AND session_order = $2;
    `;
    
    const result = await pool.query(query, [semester, sessionOrder]);
    return result.rows[0]?.is_active || false;
  }

  static async isDiscussionAttendanceActive(semester, sessionOrder) {
    const query = `
      SELECT is_active FROM "Roll-Call".discussion_dates 
      WHERE semester = $1 AND session_order = $2;
    `;
    
    const result = await pool.query(query, [semester, sessionOrder]);
    return result.rows[0]?.is_active || false;
  }

  static async markLectureAttendance(semester, studentId, actual_date, status = 'present') {
    const queryActive = `SELECT is_active FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2;`;
    const resultActive = await pool.query(queryActive, [semester, actual_date]);
    const isActive = resultActive.rows[0]?.is_active || false;
    if (!isActive) {
      throw new Error('Attendance submission is not currently open for this session');
    }

    const checkQuery = `
      SELECT * FROM "Roll-Call".attendance_lecture
      WHERE semester = $1 AND student_id = $2 AND actual_date = $3;
    `;
    const checkResult = await pool.query(checkQuery, [semester, studentId, actual_date]);
    if (checkResult.rows.length > 0) {
      throw new Error('Attendance has already been submitted for this session');
    }

    const query = `
      INSERT INTO "Roll-Call".attendance_lecture (semester, student_id, actual_date, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [semester, studentId, actual_date, status]);
    return result.rows[0];
  }

  static async markDiscussionAttendance(semester, studentId, sessionOrder, status = 'present') {
    if (sessionOrder < 1 || sessionOrder > 18) {
      throw new Error('Session order must be between 1 and 18');
    }

    const isActive = await this.isDiscussionAttendanceActive(semester, sessionOrder);
    if (!isActive) {
      throw new Error('Attendance submission is not currently open for this session');
    }
    
    const columnName = `date${sessionOrder}`;
    
    const query = `
      INSERT INTO "Roll-Call".attendance_discussion (semester, student_id, ${columnName})
      VALUES ($1, $2, $3)
      ON CONFLICT (semester, student_id)
      DO UPDATE SET ${columnName} = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    const result = await pool.query(query, [semester, studentId, status]);
    return result.rows[0];
  }

  static async getLectureAttendance(semester, studentId) {
    const query = `
      SELECT * FROM "Roll-Call".attendance_lecture 
      WHERE semester = $1 AND student_id = $2;
    `;
    const result = await pool.query(query, [semester, studentId]);
    return result.rows;
  }

  static async getDiscussionAttendance(semester, studentId) {
    const query = `
      SELECT * FROM "Roll-Call".attendance_discussion 
      WHERE semester = $1 AND student_id = $2;
    `;
    
    const result = await pool.query(query, [semester, studentId]);
    return result.rows[0];
  }

  static async getAllLectureAttendance(semester) {
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

  static async getAllDiscussionAttendance(semester) {
    const query = `
      SELECT 
        s.student_id,
        s.name,
        s.department,
        s.group_name,
        ad.date1, ad.date2, ad.date3, ad.date4, ad.date5, ad.date6,
        ad.date7, ad.date8, ad.date9, ad.date10, ad.date11, ad.date12,
        ad.date13, ad.date14, ad.date15, ad.date16, ad.date17, ad.date18,
        ad.created_at, ad.updated_at
      FROM "Roll-Call".students s
      LEFT JOIN "Roll-Call".attendance_discussion ad 
        ON s.semester = ad.semester AND s.student_id = ad.student_id
      WHERE s.semester = $1
      ORDER BY s.group_name, s.student_id;
    `;
    
    const result = await pool.query(query, [semester]);
    return result.rows;
  }
}

export default AttendanceModel;