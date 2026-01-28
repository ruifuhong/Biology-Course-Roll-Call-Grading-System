import { pool } from './database.js';

export async function findBySemesterAndGroup(semester, group_name, excludeStudentId) {
  try {
    const result = await pool.query(
      'SELECT name, student_id FROM "Roll-Call".students WHERE semester = $1 AND group_name = $2 AND student_id <> $3 ORDER BY student_id',
      [semester, group_name, excludeStudentId]
    );
    return result.rows;
  } catch (error) {
    console.error('StudentModel findBySemesterAndGroup error:', error);
    throw error;
  }
}

export async function findGroupsWithMembers(semester, groupNamesArray) {
  try {
    if (!groupNamesArray || groupNamesArray.length === 0) return [];
    const result = await pool.query(
      `SELECT group_name, name, student_id FROM "Roll-Call".students WHERE semester = $1 AND group_name = ANY($2) ORDER BY group_name, student_id`,
      [semester, groupNamesArray]
    );

    const groupMap = {};
    for (const row of result.rows) {
      if (!groupMap[row.group_name]) groupMap[row.group_name] = [];
      groupMap[row.group_name].push({ name: row.name, student_id: row.student_id });
    }
    
    return Object.entries(groupMap).map(([group_name, members]) => ({ group_name, members }));

  } catch (error) {
    console.error('StudentModel findGroupsWithMembers error:', error);
    throw error;
  }
}

export async function createStudent(studentData) {
  try {
    const { student_id, semester, department, group_name, name } = studentData;
    
    const result = await pool.query(
      'INSERT INTO "Roll-Call".students (student_id, semester, department, group_name, name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student_id, semester, department, group_name, name]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('StudentModel create error:', error);
    throw error;
  }
}

export async function findStudentsBySemester(semester) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Roll-Call".students WHERE semester = $1 ORDER BY student_id',
      [semester]
    );
    
    return result.rows;
  } catch (error) {
    console.error('StudentModel findBySemester error:', error);
    throw error;
  }
}

export async function findStudentById(semester, studentId) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Roll-Call".students WHERE semester = $1 AND student_id = $2',
      [semester, studentId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('StudentModel findById error:', error);
    throw error;
  }
}

export async function updateStudent(semester, studentId, studentData) {
  try {
    const { student_id, department, group_name, name } = studentData;
    
    const result = await pool.query(
      'UPDATE "Roll-Call".students SET student_id = $1, department = $2, group_name = $3, name = $4 WHERE semester = $5 AND student_id = $6 RETURNING *',
      [student_id, department, group_name, name, semester, studentId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('StudentModel update error:', error);
    throw error;
  }
}

export async function deleteStudent(semester, studentId) {
  try {
    const result = await pool.query(
      'DELETE FROM "Roll-Call".students WHERE semester = $1 AND student_id = $2 RETURNING *',
      [semester, studentId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('StudentModel delete error:', error);
    throw error;
  }
}