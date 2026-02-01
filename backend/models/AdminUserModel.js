import bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { pool } from './database.js';

const TABLE = '"Roll-Call".admin_users';

export async function findUserByUsername(username) {
  try {
    const result = await pool.query(
      `SELECT * FROM ${TABLE} WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  } catch (err) {
    console.error('AdminUserModel findUserByUsername error:', err);
    throw err;
  }
}

export async function verifyPassword(user, password) {
  try {
    return await bcrypt.compare(password, user.password_hash);
  } catch (err) {
    console.error('AdminUserModel verifyPassword error:', err);
    throw err;
  }
}

export async function getTANameById(ta_id) {
  try {
    const result = await pool.query('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', [ta_id]);
    return result.rows[0]?.name || null;
  } catch (err) {
    console.error('AdminUserModel getTANameById error:', err);
    throw err;
  }
}

export async function getTASemesters(ta_id) {
  try {
    const result = await pool.query(`SELECT semester FROM "Roll-Call".ta_semesters WHERE ta_id = $1`, [ta_id]);
    return result.rows.map(row => row.semester);
  } catch (err) {
    console.error('AdminUserModel getTASemesters error:', err);
    throw err;
  }
}

export async function getLecturerInfoById(id) {
  try {
    const result = await pool.query(`SELECT username FROM ${TABLE} WHERE id = $1`, [id]);
    return { username: result.rows[0]?.username || '' };
  } catch (err) {
    console.error('AdminUserModel getLecturerInfoById error:', err);
    throw err;
  }
}

export async function getTAInfoById(id) {
  try {
    const userResult = await pool.query(`SELECT username FROM "Roll-Call".admin_users WHERE id = $1`, [id]);
    const username = userResult.rows[0]?.username || '';
    const nameResult = await pool.query('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', [id]);
    const name = nameResult.rows[0]?.name || username;
    return { username, name };
  } catch (err) {
    console.error('AdminUserModel getTAInfoById error:', err);
    throw err;
  }
}

export async function findUserById(id) {
  try {
    const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
    return result.rows[0];
  } catch (err) {
    console.error('AdminUserModel findUserById error:', err);
    throw err;
  }
}

export async function createUser({ username, password, role }) {
  try {
    const exists = await findUserByUsername(username);
    if (exists) return null;
    const id = uuidv7();
    const password_hash = await bcrypt.hash(password, 10); // Set salt rounds to 10
    const result = await pool.query(`INSERT INTO ${TABLE} (id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`, [id, username, password_hash, role]);
    return result.rows[0];
  } catch (err) {
    console.error('AdminUserModel createUser error:', err);
    throw err;
  }
}

export async function addTAName({ ta_id, name }) {
  try {
    await pool.query(`INSERT INTO "Roll-Call".ta_names (ta_id, name) VALUES ($1, $2)`, [ta_id, name]);
  } catch (err) {
    console.error('AdminUserModel addTAName error:', err);
    throw err;
  }
}

export async function addTASemester({ ta_id, semester }) {
  try {
    await pool.query(`INSERT INTO "Roll-Call".ta_semesters (ta_id, semester) VALUES ($1, $2)`, [ta_id, semester]);
  } catch (err) {
    console.error('AdminUserModel addTASemester error:', err);
    throw err;
  }
}

// export async function getAllTADetails() {
//   try {
//     const result = await pool.query(`
//       SELECT u.id, u.username, n.name, array_remove(array_agg(s.semester), NULL) AS semesters
//       FROM "Roll-Call".admin_users u
//       LEFT JOIN "Roll-Call".ta_names n ON u.id = n.ta_id
//       LEFT JOIN "Roll-Call".ta_semesters s ON u.id = s.ta_id
//       WHERE u.role = 'ta'
//       GROUP BY u.id, u.username, n.name
//     `);
//     return result.rows;
//   } catch (err) {
//     console.error('AdminUserModel getAllTADetails error:', err);
//     throw err;
//   }
// }

export async function getAllTADetails() {
  const query = `
    SELECT 
      u.id, u.username, n.name, 'legacy' as provider,
      array_remove(array_agg(s.semester), NULL) AS semesters
    FROM "Roll-Call".admin_users u
    LEFT JOIN "Roll-Call".ta_names n ON u.id = n.ta_id
    LEFT JOIN "Roll-Call".ta_semesters s ON u.id = s.ta_id
    WHERE u.role = 'ta'
    GROUP BY u.id, u.username, n.name

    UNION ALL

    SELECT 
      o.id, o.email as username, o.name, o.provider,
      array_remove(array_agg(gs.semester), NULL) AS semesters
    FROM "Roll-Call".oauth_accounts o
    LEFT JOIN "Roll-Call".oauth_ta_semesters gs ON o.id = gs.ta_id
    WHERE o.role = 'ta'
    GROUP BY o.id, o.email, o.name, o.provider;
  `;
  const result = await pool.query(query);
  return result.rows;
}

export async function getAllUsers() {
  try {
    const result = await pool.query(`SELECT * FROM ${TABLE}`);
    return result.rows;
  } catch (err) {
    console.error('AdminUserModel getAllUsers error:', err);
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    await pool.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
  } catch (err) {
    console.error('AdminUserModel deleteUser error:', err);
    throw err;
  }
}

export async function deleteTANames(ta_id) {
  try {
    await pool.query(`DELETE FROM "Roll-Call".ta_names WHERE ta_id = $1`, [ta_id]);
  } catch (err) {
    console.error('AdminUserModel deleteTANames error:', err);
    throw err;
  }
}

export async function deleteTASemesters(ta_id) {
  try {
    await pool.query('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', [ta_id]);
  } catch (err) {
    console.error('AdminUserModel deleteTASemesters error:', err);
    throw err;
  }
}

export async function updateTAName({ ta_id, name }) {
  try {
    const result = await pool.query('SELECT name FROM "Roll-Call".ta_names WHERE ta_id = $1', [ta_id]);
    const old = result.rows[0] || {};
    if (old.name !== name) {
      await pool.query('UPDATE "Roll-Call".ta_names SET name = $1 WHERE ta_id = $2', [name, ta_id]);
    }
  } catch (err) {
    console.error('AdminUserModel updateTAName error:', err);
    throw err;
  }
}

export async function updateTAUsername(id, username) {
  try {
    await pool.query('UPDATE "Roll-Call".admin_users SET username = $1 WHERE id = $2', [username, id]);
  } catch (err) {
    console.error('AdminUserModel updateTAUsername error:', err);
    throw err;
  }
}

export async function setTASemesters(ta_id, semesters) {
  try {
    const result = await pool.query('SELECT semester FROM "Roll-Call".ta_semesters WHERE ta_id = $1', [ta_id]);
    const oldSemesters = result.rows.map(row => row.semester).sort();
    const newSemesters = (Array.isArray(semesters) ? semesters : []).slice().sort();
    const isSame = oldSemesters.length === newSemesters.length && oldSemesters.every((v, i) => v === newSemesters[i]);
    if (!isSame) {
      await pool.query('DELETE FROM "Roll-Call".ta_semesters WHERE ta_id = $1', [ta_id]);
      if (newSemesters.length > 0) {
        for (const semester of newSemesters) {
          await pool.query('INSERT INTO "Roll-Call".ta_semesters (ta_id, semester) VALUES ($1, $2)', [ta_id, semester]);
        }
      }
    }
  } catch (err) {
    console.error('AdminUserModel setTASemesters error:', err);
    throw err;
  }
}

export async function updateUserPassword(id, newPassword) {
  try {
    const bcrypt = await import('bcrypt');
    const password_hash = await bcrypt.default.hash(newPassword, 10);
    await pool.query(`UPDATE ${TABLE} SET password_hash = $1 WHERE id = $2`, [password_hash, id]);
  } catch (err) {
    console.error('AdminUserModel updateUserPassword error:', err);
    throw err;
  }
}