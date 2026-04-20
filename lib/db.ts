import { sql } from '@vercel/postgres';

export async function createTables() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create verification_codes table
    await sql`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes'
      );
    `;

    console.log('Tables created successfully');
    return { success: true, message: 'Tables created' };
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export async function insertUser(fullName: string, email: string, password: string) {
  try {
    const result = await sql`
      INSERT INTO users (full_name, email, password)
      VALUES (${fullName}, ${email}, ${password})
      RETURNING id, email;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, full_name, email, password FROM users WHERE email = ${email};
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function saveVerificationCode(email: string, code: string) {
  try {
    await sql`
      INSERT INTO verification_codes (email, code)
      VALUES (${email}, ${code});
    `;
    return { success: true };
  } catch (error) {
    console.error('Error saving verification code:', error);
    throw error;
  }
}

export async function verifyCode(email: string, code: string) {
  try {
    const result = await sql`
      SELECT id FROM verification_codes
      WHERE email = ${email}
      AND code = ${code}
      AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}
