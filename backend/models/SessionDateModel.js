import { pool } from './database.js';

export async function createLectureDate(semester, actualDate, attendanceRequired = true) {
  try {
    const existingDate = await pool.query(
      'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2',
      [semester, actualDate]
    );
    if (existingDate.rows.length > 0) {
      throw new Error(`該學期已存在此正課日期 Date ${actualDate} already exists for semester ${semester}`);
    }
    const result = await pool.query(
      'INSERT INTO "Roll-Call".lecture_dates (semester, actual_date, status, opened_at, attendance_required) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [semester, actualDate, 'closed', null, attendanceRequired]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel createLectureDate error:', error);
    throw error;
  }
}

export async function createDiscussionDate(semester, actualDate) {
  try {
    const existingDate = await pool.query(
      'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2',
      [semester, actualDate]
    );
    if (existingDate.rows.length > 0) {
      throw new Error(`該學期已存在此討論課日期 Discussion date ${actualDate} already exists for semester ${semester}`);
    }
    const result = await pool.query(
      'INSERT INTO "Roll-Call".discussion_dates (semester, actual_date, status, opened_at, late_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [semester, actualDate, 'closed', null, null]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel createDiscussionDate error:', error);
    throw error;
  }
}

export async function getLectureDate(semester, actualDate) {
  try {
    const result = await pool.query(
      'SELECT *, attendance_required FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2',
      [semester, actualDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel getLectureDate error:', error);
    throw error;
  }
}

export async function getDiscussionDate(semester, actualDate) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2',
      [semester, actualDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel getDiscussionDate error:', error);
    throw error;
  }
}
export async function getLectureDatesBySemester(semester) {
  try {
    const result = await pool.query(
      'SELECT *, attendance_required FROM "Roll-Call".lecture_dates WHERE semester = $1 ORDER BY actual_date',
      [semester]
    );
    return result.rows;
  } catch (error) {
    console.error('SessionDateModel getLectureDates error:', error);
    throw error;
  }
}

export async function getDiscussionDatesBySemester(semester) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 ORDER BY actual_date',
      [semester]
    );
    
    return result.rows;
  } catch (error) {
    console.error('SessionDateModel getDiscussionDates error:', error);
    throw error;
  }
}

export async function updateLectureDate(semester, oldDate, newDate) {
  try {
    const result = await pool.query(
      'UPDATE "Roll-Call".lecture_dates SET actual_date = $1, updated_at = NOW() WHERE semester = $2 AND actual_date = $3 RETURNING *',
      [newDate, semester, oldDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel updateLectureDate error:', error);
    throw error;
  }
}

export async function updateDiscussionDate(semester, oldDate, newDate) {
  try {
    const result = await pool.query(
      'UPDATE "Roll-Call".discussion_dates SET actual_date = $1, updated_at = NOW() WHERE semester = $2 AND actual_date = $3 RETURNING *',
      [newDate, semester, oldDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel updateDiscussionDate error:', error);
    throw error;
  }
}

export async function deleteLectureDate(semester, actualDate) {
  try {
    const result = await pool.query(
      'DELETE FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2 RETURNING *',
      [semester, actualDate]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel deleteLectureDate error:', error);
    throw error;
  }
}

export async function deleteDiscussionDate(semester, actualDate) {
  try {
    const result = await pool.query(
      'DELETE FROM "Roll-Call".discussion_dates WHERE semester = $1 AND actual_date = $2 RETURNING *',
      [semester, actualDate]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel deleteDiscussionDate error:', error);
    throw error;
  }
}

export async function toggleLectureAttendance(semester, selectedDate, status) {
  try {
    let openedAt = null;
    if (status === 'open') {
      openedAt = new Date();
    }
    const result = await pool.query(
      'UPDATE "Roll-Call".lecture_dates SET status = $1, opened_at = $2, updated_at = NOW() WHERE semester = $3 AND actual_date = $4 RETURNING *',
      [status, openedAt, semester, selectedDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel toggleLectureAttendance error:', error);
    throw error;
  }
}

export async function toggleDiscussionAttendance(semester, selectedDate, newStatus) {
  try {
    let openedAt = null;
    let lateAt = null;
    if (newStatus === 'open') {
      openedAt = new Date();
      lateAt = null;
    } else if (newStatus === 'late') {
      lateAt = new Date();
    } else if (newStatus === 'closed') {
      openedAt = null;
      lateAt = null;
    }
    const result = await pool.query(
      'UPDATE "Roll-Call".discussion_dates SET status = $1, opened_at = $2, late_at = $3, updated_at = NOW() WHERE semester = $4 AND actual_date = $5 RETURNING *',
      [newStatus, openedAt, lateAt, semester, selectedDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel toggleDiscussionAttendance error:', error);
    throw error;
  }
}

export async function setLectureAttendanceRequired(semester, actualDate, attendanceRequired) {
  try {
    const result = await pool.query(
      'UPDATE "Roll-Call".lecture_dates SET attendance_required = $1, updated_at = NOW() WHERE semester = $2 AND actual_date = $3 RETURNING *',
      [attendanceRequired, semester, actualDate]
    );
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel setLectureAttendanceRequired error:', error);
    throw error;
  }
}