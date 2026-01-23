import { pool } from './database.js';

export async function insertIntraReviews(reviews) {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0;
  const values = [];
  const params = [];
  let idx = 1;
  for (const r of reviews) {
    values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    params.push(
      r.semester,
      r.actual_date,
      r.reviewer_id,
      r.reviewer_semester,
      r.reviewee_id,
      r.reviewee_semester,
      r.score
    );
  }
  const sql = `INSERT INTO "Roll-Call".review_intra_group
    (semester, actual_date, reviewer_id, reviewer_semester, reviewee_id, reviewee_semester, score)
    VALUES ${values.join(', ')} RETURNING id`;
  const result = await pool.query(sql, params);
  return result.rowCount;
}

export async function insertInterReviews(reviews) {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0;
  const values = [];
  const params = [];
  let idx = 1;
  for (const r of reviews) {
    values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    params.push(
      r.semester,
      r.actual_date,
      r.reviewer_group_id,
      r.reviewee_group_id,
      r.score
    );
  }
  const sql = `INSERT INTO "Roll-Call".review_inter_group
    (semester, actual_date, reviewer_group_id, reviewee_group_id, score)
    VALUES ${values.join(', ')} RETURNING id`;
  const result = await pool.query(sql, params);
  return result.rowCount;
}

export async function getIntraReviewSummary(semester) {
  const result = await pool.query(
    `SELECT reviewee_id AS student_id, actual_date, AVG(score)::float AS avg_score, COUNT(*) AS count
     FROM "Roll-Call".review_intra_group
     WHERE semester = $1
     GROUP BY reviewee_id, actual_date
     ORDER BY reviewee_id, actual_date`,
    [semester]
  );
  return result.rows;
}

export async function getInterReviewSummary(semester) {
  const result = await pool.query(
    `SELECT reviewee_group_id, actual_date, AVG(score)::float AS avg_score, COUNT(*) AS count
     FROM "Roll-Call".review_inter_group
     WHERE semester = $1
     GROUP BY reviewee_group_id, actual_date
     ORDER BY reviewee_group_id, actual_date`,
    [semester]
  );
  return result.rows;
}

export async function hasDiscussionAttendance(semester, actual_date, studentId) {
  const result = await pool.query(
    `SELECT status FROM "Roll-Call".attendance_discussion WHERE semester = $1 AND actual_date = $2 AND student_id = $3`,
    [semester, actual_date, studentId]
  );
  return result.rows.length > 0;
}


export async function getDiscussionAttendanceStatus(semester, actual_date, studentIds) {
  if (!studentIds || studentIds.length === 0) return {};
  const result = await pool.query(
    `SELECT student_id, status FROM "Roll-Call".attendance_discussion WHERE semester = $1 AND actual_date = $2 AND student_id = ANY($3)`,
    [semester, actual_date, studentIds]
  );
   
  const statusMap = {};
  for (const row of result.rows) {
    statusMap[row.student_id] = row.status;
  }
  return statusMap;
}

export async function getDenominatorsBySemester(semester) {
  const result = await pool.query(
    `SELECT student_id, denominator FROM "Roll-Call".session_denominator WHERE semester = $1`,
    [semester]
  );
  return result.rows;
}

export async function upsertDenominator(semester, student_id, denominator) {
  const result = await pool.query(
    `INSERT INTO "Roll-Call".session_denominator (semester, student_id, denominator)
     VALUES ($1, $2, $3)
     ON CONFLICT (semester, student_id)
     DO UPDATE SET denominator = EXCLUDED.denominator, updated_at = CURRENT_TIMESTAMP`,
    [semester, student_id, denominator]
  );
  return result.rowCount;
}

export async function checkIntraReviewExists(reviewerId, semester, actualDate) {
  const result = await pool.query(
    `SELECT 1 FROM "Roll-Call".review_intra_group
     WHERE reviewer_id = $1 AND semester = $2 AND actual_date = $3
     LIMIT 1`,
    [reviewerId, semester, actualDate]
  );
  return result.rows.length > 0;
}

export async function checkInterReviewExists(reviewerGroupId, semester, actualDate) {
  const result = await pool.query(
    `SELECT 1 FROM "Roll-Call".review_inter_group
     WHERE reviewer_group_id = $1 AND semester = $2 AND actual_date = $3
     LIMIT 1`,
    [reviewerGroupId, semester, actualDate]
  );
  return result.rows.length > 0;
}

export async function checkAnyReviewExists({ reviewerId, reviewerGroupId, semester, actualDate }) {
  const [intra, inter] = await Promise.all([
    reviewerId ? checkIntraReviewExists(reviewerId, semester, actualDate) : false,
    reviewerGroupId ? checkInterReviewExists(reviewerGroupId, semester, actualDate) : false
  ]);
  return intra || inter;
}