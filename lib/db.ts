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

    console.log('Saved verification code:', { email: normalizedEmail, code: normalizedCode });
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

    console.log('=== VERIFY CODE ===');
    console.log('Email:', normalizedEmail);
    console.log('Code to verify:', normalizedCode);

    // Get latest code for this email (ignore expiration for now)
    const result = await sql`
      SELECT id, code, email FROM verification_codes
      WHERE email = ${normalizedEmail}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    console.log('Found in DB:', result.rows);

    if (result.rows.length === 0) {
      console.log('No code found for email');
      return false;
    }

    const dbCode = result.rows[0].code;
    console.log('DB Code:', dbCode);
    console.log('Match:', dbCode === normalizedCode);

    return dbCode === normalizedCode;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

// Aircraft functions
export async function insertAircraft(registration: string, model: string, airline: string) {
  try {
    const result = await sql`
      INSERT INTO aircraft (registration, model, airline)
      VALUES (${registration}, ${model}, ${airline})
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting aircraft:', error);
    throw error;
  }
}

export async function getAllAircraft() {
  try {
    const result = await sql`
      SELECT * FROM aircraft ORDER BY created_at DESC;
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting aircraft:', error);
    throw error;
  }
}

// Flight functions
export async function insertFlight(flightNumber: string, aircraftId: number, departurCity: string, arrivalCity: string, departureTime: string, arrivalTime: string) {
  try {
    const result = await sql`
      INSERT INTO flights (flight_number, aircraft_id, departure_city, arrival_city, departure_time, arrival_time)
      VALUES (${flightNumber}, ${aircraftId}, ${departurCity}, ${arrivalCity}, ${departureTime}, ${arrivalTime})
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting flight:', error);
    throw error;
  }
}

export async function getAllFlights() {
  try {
    const result = await sql`
      SELECT f.*, a.registration, a.model, a.airline
      FROM flights f
      LEFT JOIN aircraft a ON f.aircraft_id = a.id
      ORDER BY f.departure_time DESC;
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting flights:', error);
    throw error;
  }
}

// Shipment functions
export async function insertShipment(trackingNumber: string, flightId: number, origin: string, destination: string, weight: number) {
  try {
    const result = await sql`
      INSERT INTO shipments (tracking_number, flight_id, origin, destination, weight)
      VALUES (${trackingNumber}, ${flightId}, ${origin}, ${destination}, ${weight})
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting shipment:', error);
    throw error;
  }
}

export async function getAllShipments() {
  try {
    const result = await sql`
      SELECT s.*, f.flight_number, f.departure_city, f.arrival_city
      FROM shipments s
      LEFT JOIN flights f ON s.flight_id = f.id
      ORDER BY s.created_at DESC;
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting shipments:', error);
    throw error;
  }
}

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

// Tracking History functions
export async function insertTrackingHistory(trackingNumber: string, status: string, location: string, notes?: string) {
  try {
    const result = await sql`
      INSERT INTO tracking_history (tracking_number, status, location, notes)
      VALUES (${trackingNumber}, ${status}, ${location}, ${notes || ''})
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting tracking history:', error);
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
