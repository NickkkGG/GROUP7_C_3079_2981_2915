import { sql } from '@vercel/postgres';

export async function insertUser(fullName: string, email: string, password: string, role: string = 'user') {
  try {
    const result = await sql`
      INSERT INTO users (fullname, email, password, role)
      VALUES (${fullName}, ${email}, ${password}, ${role})
      RETURNING id, email, fullname, role;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
}

// Verifikasi role requester langsung dari DB (jangan percaya cookie/role dari client)
export async function getRoleByEmail(email: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT role FROM users WHERE email = ${email.toLowerCase().trim()};
    `;
    return result.rows[0]?.role ?? null;
  } catch (error) {
    console.error('Error getting role:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, fullname, email, password, role FROM users WHERE email = ${email};
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function saveVerificationCode(email: string, code: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toUpperCase().trim();

    await sql`
      INSERT INTO verification_codes (email, code)
      VALUES (${normalizedEmail}, ${normalizedCode});
    `;

    return { success: true };
  } catch (error) {
    console.error('Error saving verification code:', error);
    throw error;
  }
}

export async function verifyCode(email: string, code: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toUpperCase().trim();

    // Get latest non-expired code for this email
    const result = await sql`
      SELECT id, code FROM verification_codes
      WHERE email = ${normalizedEmail}
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return false;
    }

    const { code: dbCode } = result.rows[0];
    if (dbCode !== normalizedCode) {
      return false;
    }

    // Single-use: invalidate all codes for this email once verified
    await sql`DELETE FROM verification_codes WHERE email = ${normalizedEmail};`;

    return true;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

// Shipment & tracking lookups
export async function getShipmentByTracking(trackingNumber: string) {
  try {
    const result = await sql`
      SELECT s.*, f.flight_number, f.departure_city, f.arrival_city, f.status as flight_status
      FROM shipments s
      LEFT JOIN flights f ON s.flight_id = f.id
      WHERE s.tracking_number = ${trackingNumber};
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting shipment:', error);
    throw error;
  }
}

export async function getTrackingHistory(trackingNumber: string) {
  try {
    const result = await sql`
      SELECT * FROM tracking_history
      WHERE tracking_number = ${trackingNumber}
      ORDER BY timestamp ASC;
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting tracking history:', error);
    throw error;
  }
}
