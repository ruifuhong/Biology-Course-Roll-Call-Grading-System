import { pool } from './database.js';

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