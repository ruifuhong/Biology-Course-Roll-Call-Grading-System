import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './database.js';

const TABLE = '"Roll-Call".admin_users';

export async function findUserByUsername(username) {
  const result = await pool.query(
    `SELECT * FROM ${TABLE} WHERE username = $1`,
    [username]
  );
  return result.rows[0];
}

export async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password_hash);
}

export async function getTANameById(ta_id) {
  const result = await pool.query('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', [ta_id]);
  return result.rows[0]?.name || null;
}

export async function getTASemesters(ta_id) {
  const result = await pool.query(
    'SELECT semester FROM "Roll-Call".ta_semesters WHERE ta_id = $1',
    [ta_id]
  );
  return result.rows.map(row => row.semester);
}

export async function getLecturerInfoById(id) {
  const result = await pool.query(`SELECT username FROM ${TABLE} WHERE id = $1`, [id]);
  return { username: result.rows[0]?.username || '' };
}

export async function getTAInfoById(id) {
  const userResult = await pool.query(`SELECT username FROM "Roll-Call".admin_users WHERE id = $1`, [id]);
  const username = userResult.rows[0]?.username || '';
  const nameResult = await pool.query('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', [id]);
  const name = nameResult.rows[0]?.name || username;
  return { username, name };
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT * FROM ${TABLE} WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function createUser({ username, password, role }) {
  const exists = await findUserByUsername(username);
  if (exists) return null;
  const id = uuidv4();
  const password_hash = await bcrypt.hash(password, 10); // Set salt rounds to 10
  const result = await pool.query(
    `INSERT INTO ${TABLE} (id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, username, password_hash, role]
  );
  return result.rows[0];
}

export async function addTAName({ ta_id, name }) {
  await pool.query(
    'INSERT INTO "Roll-Call".ta_names (ta_id, name) VALUES ($1, $2)',
    [ta_id, name]
  );
}

export async function addTASemester({ ta_id, semester }) {
  await pool.query(
    'INSERT INTO "Roll-Call".ta_semesters (ta_id, semester) VALUES ($1, $2)',
    [ta_id, semester]
  );
}

export async function getAllTADetails() {
  const result = await pool.query(`
    SELECT u.id, u.username, n.name, array_remove(array_agg(s.semester), NULL) AS semesters
    FROM "Roll-Call".admin_users u
    LEFT JOIN "Roll-Call".ta_names n ON u.id = n.ta_id
    LEFT JOIN "Roll-Call".ta_semesters s ON u.id = s.ta_id
    WHERE u.role = 'ta'
    GROUP BY u.id, u.username, n.name
  `);
  return result.rows;
}

export async function getAllUsers() {
  const result = await pool.query(`SELECT * FROM ${TABLE}`);
  return result.rows;
}

export async function deleteUser(id) {
  await pool.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
}

export async function deleteTANames(ta_id) {
  await pool.query('DELETE FROM "Roll-Call".ta_names WHERE ta_id = $1', [ta_id]);
}

export async function deleteTASemesters(ta_id) {
  await pool.query('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', [ta_id]);
}

export async function updateTAName({ ta_id, name }) {
  const result = await pool.query('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', [ta_id]);
  const old = result.rows[0] || {};
  if (old.name !== name) {
    await pool.query(
      'UPDATE "Roll-Call".ta_names SET name = $1 WHERE ta_id = $2',
      [name, ta_id]
    );
  }
}

export async function updateTAUsername(id, username) {
  await pool.query(
    'UPDATE "Roll-Call".admin_users SET username = $1 WHERE id = $2',
    [username, id]
  );
}

export async function setTASemesters(ta_id, semesters) {
  const result = await pool.query('SELECT semester FROM "Roll-Call".ta_semesters WHERE ta_id = $1', [ta_id]);
  const oldSemesters = result.rows.map(row => row.semester).sort();
  const newSemesters = (Array.isArray(semesters) ? semesters : []).slice().sort();
  
  const isSame = oldSemesters.length === newSemesters.length && oldSemesters.every((v, i) => v === newSemesters[i]);
  if (!isSame) {
    await pool.query('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', [ta_id]);
    if (newSemesters.length > 0) {
      for (const semester of newSemesters) {
        await pool.query(
          'INSERT INTO "Roll-Call".ta_semesters (ta_id, semester) VALUES ($1, $2)',
          [ta_id, semester]
        );
      }
    }
  }
}

export async function updateUserPassword(id, newPassword) {
  const bcrypt = await import('bcrypt');
  const password_hash = await bcrypt.default.hash(newPassword, 10);
  await pool.query(
    `UPDATE ${TABLE} SET password_hash = $1 WHERE id = $2`,
    [password_hash, id]
  );
}