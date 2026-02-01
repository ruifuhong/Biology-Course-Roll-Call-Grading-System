import { pool } from './database.js';
import { v7 as uuidv7 } from 'uuid';

const TABLE = '"Roll-Call".oauth_accounts';

export async function findOAuthUserByEmail(email) {
  try {
    const result = await pool.query(
      `SELECT * FROM ${TABLE} WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  } catch (err) {
    console.error('AuthModel findOAuthUserByEmail error:', err);
    throw err;
  }
}

export async function createOAuthAccount({ email, username, name, role, provider }) {
  try {
    const resExist = await pool.query(
      `SELECT id FROM "Roll-Call".oauth_accounts WHERE email = $1`, 
      [email]
    );
    if (resExist.rows.length > 0) return null;

    const id = uuidv7();
    const result = await pool.query(
      `INSERT INTO ${TABLE} (id, email, username, name, role, provider) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`, 
      [id, email, username, name, role, provider]
    );
    return result.rows[0];
  } catch (err) {
    console.error('AdminUserModel createOAuthAccount error:', err);
    throw err;
  }
}