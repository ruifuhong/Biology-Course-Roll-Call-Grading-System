import { pool } from './database.js';

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