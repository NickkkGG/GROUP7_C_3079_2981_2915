import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { validateShipmentInput } from '@/lib/validation';
import { computeTariff } from '@/lib/pricing';
import { requireOperator } from '@/lib/auth';

// Alur status & lokasi untuk tracking history
const STATUS_FLOW = ['booked', 'received', 'in_transit', 'arrived', 'delivered'];
const STEP_LOCATION: Record<string, string> = {
  booked: 'Origin Warehouse',
  received: 'Origin Hub',
  in_transit: 'In Flight',
  arrived: 'Destination Hub',
  delivered: 'Final Destination',
};

// Pastikan ada entri tracking_history dari 'booked' s/d status saat ini (idempotent)
async function syncTrackingHistory(trackingNumber: string, status: string) {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx < 0) return;
  for (let i = 0; i <= idx; i++) {
    const st = STATUS_FLOW[i];
    await sql.query(
      `INSERT INTO tracking_history (tracking_number, status, location, notes, timestamp)
       SELECT $1::varchar, $2::varchar, $3::varchar, $4::text, NOW() + ($5::int * INTERVAL '1 second')
       WHERE NOT EXISTS (
         SELECT 1 FROM tracking_history WHERE tracking_number = $1::varchar AND status = $2::varchar
       )`,
      [trackingNumber, st, STEP_LOCATION[st], 'Status update', i]
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build search query
    let query = `
      SELECT s.*, f.flight_number, f.departure_city, f.arrival_city
      FROM shipments s
      LEFT JOIN flights f ON s.flight_id = f.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        s.tracking_number ILIKE $${paramIndex} OR
        s.sender ILIKE $${paramIndex} OR
        s.recipient_name ILIKE $${paramIndex} OR
        s.item_type ILIKE $${paramIndex} OR
        s.origin ILIKE $${paramIndex} OR
        s.destination ILIKE $${paramIndex} OR
        s.status ILIKE $${paramIndex} OR
        f.flight_number ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (dateFrom) {
      query += ` AND s.created_at >= $${paramIndex}::timestamptz`;
      params.push(dateFrom + 'T00:00:00Z');
      paramIndex++;
    }

    if (dateTo) {
      query += ` AND s.created_at <= $${paramIndex}::timestamptz`;
      params.push(dateTo + 'T23:59:59Z');
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered`;
    const countResult = await sql.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Add pagination
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await sql.query(query, params);

    return NextResponse.json({
      shipments: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const auth = await requireOperator(body?.requesterEmail, 'shipments');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const validation = validateShipmentInput(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      tracking_number,
      sender,
      sender_contact,
      sender_address,
      recipient_name,
      recipient_contact,
      recipient_address,
      origin,
      destination,
      weight,
      item_type,
      service_type,
      flight_id,
      status,
      notes,
    } = validation.sanitized;

    // Check if tracking number already exists
    const existingShipment = await sql.query(
      'SELECT id FROM shipments WHERE tracking_number = $1',
      [tracking_number]
    );

    if (existingShipment.rows.length > 0) {
      return NextResponse.json({ error: 'Tracking number already exists' }, { status: 400 });
    }

    // CAPACITY CHECK: Jika flight dipilih, cek kapasitas pesawat
    if (flight_id) {
      const capacityResult = await sql.query(
        `SELECT a.capacity as max_capacity,
          COALESCE((SELECT SUM(s.weight) FROM shipments s WHERE s.flight_id = $1 AND s.status <> 'cancelled'), 0) as used_capacity
         FROM flights f
         LEFT JOIN aircraft a ON f.aircraft_id = a.id
         WHERE f.id = $1`,
        [flight_id]
      );

      if (capacityResult.rows.length > 0) {
        const { max_capacity, used_capacity } = capacityResult.rows[0];
        const maxKg = parseFloat(max_capacity) || 0;
        const usedKg = parseFloat(used_capacity) || 0;

        if (maxKg > 0 && (usedKg + weight) > maxKg) {
          const remaining = maxKg - usedKg;
          return NextResponse.json({
            error: `Shipment Error: Aircraft capacity exceeded. Remaining capacity: ${remaining.toFixed(1)} kg, but shipment weight is ${weight} kg.`
          }, { status: 400 });
        }
      }
    }

    const tariff = computeTariff(service_type, weight);

    // Insert new shipment
    const result = await sql.query(
      `INSERT INTO shipments (
        tracking_number, sender, sender_contact, sender_address,
        recipient_name, recipient_contact, recipient_address,
        origin, destination, weight, item_type, service_type, tariff,
        flight_id, status, notes, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *`,
      [
        tracking_number,
        sender,
        sender_contact || null,
        sender_address || null,
        recipient_name,
        recipient_contact || null,
        recipient_address || null,
        origin,
        destination,
        weight,
        item_type,
        service_type,
        tariff,
        flight_id,
        status,
        notes
      ]
    );

    // Buat entri tracking_history awal sesuai status (perbaikan timeline shipment baru)
    await syncTrackingHistory(tracking_number, status);

    return NextResponse.json({
      success: true,
      shipment: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const auth = await requireOperator(body?.requesterEmail, 'shipments');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json({ error: 'Shipment Error: Shipment ID is required' }, { status: 400 });
    }

    // LOCK: Shipment yang sudah "delivered" tidak boleh diedit lagi
    const currentShipment = await sql.query(
      'SELECT status FROM shipments WHERE id = $1',
      [id]
    );
    if (currentShipment.rows.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    if (currentShipment.rows[0].status === 'delivered') {
      return NextResponse.json(
        { error: 'Shipment Error: This shipment has been delivered and can no longer be edited.' },
        { status: 403 }
      );
    }
    if (currentShipment.rows[0].status === 'cancelled') {
      return NextResponse.json(
        { error: 'Shipment Error: This shipment has been cancelled and can no longer be edited.' },
        { status: 403 }
      );
    }

    const validation = validateShipmentInput(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      tracking_number,
      sender,
      sender_contact,
      sender_address,
      recipient_name,
      recipient_contact,
      recipient_address,
      origin,
      destination,
      weight,
      item_type,
      service_type,
      flight_id,
      status,
      notes,
    } = validation.sanitized;

    // Check if tracking number exists for another shipment
    const existingShipment = await sql.query(
      'SELECT id FROM shipments WHERE tracking_number = $1 AND id != $2',
      [tracking_number, id]
    );

    if (existingShipment.rows.length > 0) {
      return NextResponse.json({ error: 'Tracking number already exists' }, { status: 400 });
    }

    const tariff = computeTariff(service_type, weight);

    // Update shipment
    const result = await sql.query(
      `UPDATE shipments SET
        tracking_number = $1,
        sender = $2,
        sender_contact = $3,
        sender_address = $4,
        recipient_name = $5,
        recipient_contact = $6,
        recipient_address = $7,
        origin = $8,
        destination = $9,
        weight = $10,
        item_type = $11,
        service_type = $12,
        tariff = $13,
        flight_id = $14,
        status = $15,
        notes = $16,
        updated_at = NOW()
      WHERE id = $17
      RETURNING *`,
      [
        tracking_number,
        sender,
        sender_contact || null,
        sender_address || null,
        recipient_name,
        recipient_contact || null,
        recipient_address || null,
        origin,
        destination,
        weight,
        item_type,
        service_type,
        tariff,
        flight_id,
        status,
        notes,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Sinkronkan tracking_history dengan status terbaru
    await syncTrackingHistory(tracking_number, status);

    // Notifikasi: kalau status berubah, kasih tau user yang pernah track AWB ini
    const oldStatus = currentShipment.rows[0].status;
    if (oldStatus !== status) {
      try {
        const usersWhoTracked = await sql.query(
          `SELECT DISTINCT user_email FROM user_activity
           WHERE tracking_number = $1 AND activity_type = 'track'`,
          [tracking_number]
        );

        for (const row of usersWhoTracked.rows) {
          await sql.query(
            `INSERT INTO notifications (user_email, tracking_number, message)
             VALUES ($1, $2, $3)`,
            [
              row.user_email,
              tracking_number,
              `Shipment ${tracking_number} status changed from ${oldStatus} to ${status}`
            ]
          );
        }
      } catch (notifError) {
        console.error('Error creating notifications:', notifError);
        // Jangan fail shipment update kalau notifikasi gagal
      }
    }

    return NextResponse.json({
      success: true,
      shipment: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    let reason = '';
    let requesterEmail: unknown = '';
    try {
      const body = await request.json();
      reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
      requesterEmail = body?.requesterEmail;
    } catch {
      reason = '';
    }

    const auth = await requireOperator(requesterEmail, 'shipments');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
    }
    if (reason.length < 5) {
      return NextResponse.json({ error: 'Cancellation reason must be at least 5 characters' }, { status: 400 });
    }

    // LOCK: Only shipments with status 'booked' can be cancelled
    const current = await sql.query('SELECT tracking_number, status FROM shipments WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    if (current.rows[0].status === 'cancelled') {
      return NextResponse.json({ error: 'This shipment has already been cancelled.' }, { status: 400 });
    }
    if (current.rows[0].status !== 'booked') {
      return NextResponse.json(
        { error: `Shipment cannot be cancelled because it is already "${current.rows[0].status}". Only shipments with status "booked" can be cancelled.` },
        { status: 403 }
      );
    }

    // Soft cancel: keep the record, set status to 'cancelled' and store the reason
    const result = await sql.query(
      `UPDATE shipments
       SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Record a tracking-history entry so the cancellation shows up on the timeline
    await sql.query(
      `INSERT INTO tracking_history (tracking_number, status, location, notes, timestamp)
       VALUES ($1, 'cancelled', 'Cancelled', $2, NOW())`,
      [current.rows[0].tracking_number, `Shipment cancelled: ${reason}`]
    );

    return NextResponse.json({
      success: true,
      message: 'Shipment cancelled successfully',
      shipment: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    return NextResponse.json({ error: 'Failed to cancel shipment' }, { status: 500 });
  }
}
