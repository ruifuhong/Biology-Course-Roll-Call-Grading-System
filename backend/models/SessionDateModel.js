import { pool } from './database.js';

export async function createLectureDate(semester, actualDate) {
  try {
    const existingDate = await pool.query(
      'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 AND actual_date = $2',
      [semester, actualDate]
    );
    
    if (existingDate.rows.length > 0) {
      throw new Error(`Date ${actualDate} already exists for semester ${semester}`);
    }

    const result = await pool.query(
      'INSERT INTO "Roll-Call".lecture_dates (semester, actual_date, is_active) VALUES ($1, $2, $3) RETURNING *',
      [semester, actualDate, false]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel createLectureDate error:', error);
    throw error;
  }
}

// export async function createDiscussionDate(semester, sessionOrder, actualDate) {
//   try {
//     const result = await pool.query(
//       'INSERT INTO "Roll-Call".discussion_dates (semester, session_order, actual_date) VALUES ($1, $2, $3) RETURNING *',
//       [semester, sessionOrder, actualDate]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel createDiscussionDate error:', error);
//     throw error;
//   }
// }

export async function getLectureDatesBySemester(semester) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 ORDER BY actual_date',
      [semester]
    );
    
    return result.rows;
  } catch (error) {
    console.error('SessionDateModel getLectureDates error:', error);
    throw error;
  }
}

// export async function getDiscussionDatesBySemester(semester) {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 ORDER BY session_order',
//       [semester]
//     );
    
//     return result.rows;
//   } catch (error) {
//     console.error('SessionDateModel getDiscussionDates error:', error);
//     throw error;
//   }
// }

export async function updateLectureDate(semester, oldDate, newDate) {
  try {
    const result = await pool.query(
      'UPDATE "Roll-Call".lecture_dates SET actual_date = $1 WHERE semester = $2 AND actual_date = $3 RETURNING *',
      [newDate, semester, oldDate]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('SessionDateModel updateLectureDate error:', error);
    throw error;
  }
}

// export async function updateDiscussionDate(semester, sessionOrder, actualDate) {
//   try {
//     const result = await pool.query(
//       'UPDATE "Roll-Call".discussion_dates SET actual_date = $1 WHERE semester = $2 AND session_order = $3 RETURNING *',
//       [actualDate, semester, sessionOrder]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel updateDiscussionDate error:', error);
//     throw error;
//   }
// }

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

// export async function deleteDiscussionDate(semester, sessionOrder) {
//   try {
//     const result = await pool.query(
//       'DELETE FROM "Roll-Call".discussion_dates WHERE semester = $1 AND session_order = $2 RETURNING *',
//       [semester, sessionOrder]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel deleteDiscussionDate error:', error);
//     throw error;
//   }
// }

// export async function toggleLectureAttendance(semester, sessionOrder, isActive) {
//   try {
//     const result = await pool.query(
//       'UPDATE "Roll-Call".lecture_dates SET is_active = $1 WHERE semester = $2 AND session_order = $3 RETURNING *',
//       [isActive, semester, sessionOrder]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel toggleLectureAttendance error:', error);
//     throw error;
//   }
// }

// export async function toggleDiscussionAttendance(semester, sessionOrder, isActive) {
//   try {
//     const result = await pool.query(
//       'UPDATE "Roll-Call".discussion_dates SET is_active = $1 WHERE semester = $2 AND session_order = $3 RETURNING *',
//       [isActive, semester, sessionOrder]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel toggleDiscussionAttendance error:', error);
//     throw error;
//   }
// }

// export async function getCurrentActiveLectureSession(semester) {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM "Roll-Call".lecture_dates WHERE semester = $1 AND is_active = true ORDER BY session_order LIMIT 1',
//       [semester]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel getCurrentActiveLectureSession error:', error);
//     throw error;
//   }
// }

// export async function getCurrentActiveDiscussionSession(semester) {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM "Roll-Call".discussion_dates WHERE semester = $1 AND is_active = true ORDER BY session_order LIMIT 1',
//       [semester]
//     );
    
//     return result.rows[0];
//   } catch (error) {
//     console.error('SessionDateModel getCurrentActiveDiscussionSession error:', error);
//     throw error;
//   }
// }